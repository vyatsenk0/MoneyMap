import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Container, Card, Text, Button, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

const FinancialGoalsDashboard = ({ goalAdded, setGoalAdded, onAddNewClick }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch goals from the backend (IPC), as a separate function outside of useEffect so it can be reused
  const fetchGoals = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke("get-goals");
      console.log("Response from IPC:", response); // Debugging

      // Ensure goals is an array
      setGoals(Array.isArray(response.goals) ? response.goals : []);
    } catch (err) {
      setError("Failed to fetch goals.");
      console.error("Error fetching goals:", err);
    } finally {
      setLoading(false);
      setGoalAdded(false); // Reset goalAdded flag to false after fetching goals
    }
  };

  // Fetch goals on initial render
  useEffect(() => {
    fetchGoals();
  }, []);

  // Re-fetch goals when `goalAdded` changes
  useEffect(() => {
    if (goalAdded) {
      fetchGoals(); // Trigger goal fetch when goalAdded changes
    }
  }, [goalAdded]);

  // Delete a goal and refresh the goal list
  const handleDelete = async (id) => {
    try {
      const response = await window.electron.ipcRenderer.invoke("delete-goal", id);
      if (response.success) {
        // Re-fetch the updated list of goals from the backend
        const newGoalsResponse = await window.electron.ipcRenderer.invoke("get-goals");
        setGoals(newGoalsResponse.goals); // Update state with the new goals
        notifications.show({
          color: "green",
          title: "Success",
          message: "Goal deleted successfully!",
        });
      } else {
        notifications.show({
          color: "red",
          title: "Error",
          message: response.error,
        });
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
      notifications.show({
        color: "red",
        title: "Error",
        message: "An error occurred while deleting the goal.",
      });
    }
  };

  if (loading) return <Loading>Loading...</Loading>;
  if (error) return <Error>{error}</Error>;

  return (
    <Container size="xl">
      <DashboardCard>
        <DashboardHeader>
          <Title c="white" order={1}>Financial Goals</Title>
          <Button c="white" color="green.7" onClick={onAddNewClick}><Text>Add New</Text></Button>
        </DashboardHeader>

        {/* Main Content */}
        {goals.length === 0 ? (
          <NoGoalsMessage>No financial goals found.</NoGoalsMessage>
        ) : (
          <GoalsTable>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Target Amount</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Recurring</TableHeader>
                <TableHeader>Income Amount</TableHeader>
                <TableHeader>Frequency</TableHeader>
                <TableHeader>Target Date</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <TableRow key={goal.dataValues.id}>
                  <TableData>{goal.dataValues.name}</TableData>
                  <TableData>${goal.dataValues.targetAmount}</TableData>
                  <TableData>{goal.dataValues.category}</TableData>
                  <TableData>{goal.dataValues.recurring ? "Yes" : "No"}</TableData>
                  <TableData>
                    {goal.dataValues.incomeAmount
                      ? `$${goal.dataValues.incomeAmount}`
                      : "N/A"}
                  </TableData>
                  <TableData>{goal.dataValues.frequency || "N/A"}</TableData>
                  <TableData>
                    {new Date(goal.dataValues.targetDate).toLocaleDateString()}
                  </TableData>
                  <TableData>
                    <DeleteButton onClick={() => handleDelete(goal.dataValues.id)}>
                      Delete
                    </DeleteButton>
                  </TableData>
                </TableRow>
              ))}
            </tbody>
          </GoalsTable>
        )}
      </DashboardCard>
    </Container>
  );
};

export default FinancialGoalsDashboard;

// Styled Components

const DashboardCard = styled(Card)`
  width: 90%; /* Wider dashboard */
  max-width: 1200px;
  padding: 20px;
  background-color: var(--mantine-color-green-6); /* White background for contrast */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const GoalsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background-color: #397d2c; /* Green header */
  color: white;
  padding: 10px;
  text-align: left;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: var(--mantine-color-green-7);
  }
  &:hover {
    background-color: var(--mantine-color-green-5); /* Light green on hover */
    cursor: pointer;
  }
`;

const TableData = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const DeleteButton = styled.button`
  background-color: var(--mantine-color-red-9); /* Red button */
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ff6666;
  }
`;

const NoGoalsMessage = styled(Text)`
  font-size: 1.2rem;
  color: #555;
  text-align: center;
`;

const Loading = styled.div`
  font-size: 1.5rem;
  color: #555;
  text-align: center;
`;

const Error = styled.div`
  font-size: 1.5rem;
  color: red;
  text-align: center;
`;