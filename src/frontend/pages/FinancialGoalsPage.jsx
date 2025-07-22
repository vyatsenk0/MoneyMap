import React, { useState } from "react";
import styled from "styled-components";
import FinancialGoal from "./FinancialGoal.jsx";
import FinancialGoalsDashboard from "./FinancialGoalsDashboard.jsx";
import { Flex, Container } from "@mantine/core";

const PageContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 100vh;
`;

const FormContainer = styled.div`
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  max-width: auto;
  margin: 0 auto;
  position: relative; /* To position the close button */
`;

export default function FinancialGoalsPage() {
  const [goalAdded, setGoalAdded] = useState(false);
  const [showForm, setShowForm] = useState(false); // State to toggle between dashboard and form

  // Function to handle when a goal is added
  const handleGoalAdded = () => {
    setGoalAdded(true); // Set goalAdded to true when a new goal is added
    setShowForm(false); // Return to the dashboard after adding a goal
  };

  // Function to handle "Add New" button click
  const handleAddNewClick = () => {
    setShowForm(true); // Show the form
  };

  return (
    <>
      <Flex pos="absolute" top={0} left={0} bg="linear-gradient(180deg, var(--mantine-color-green-9), var(--mantine-color-green-6))" w="100vw" h="100vh" style={{ zIndex: 0 }} />

      <Container size="xl">
        {showForm ? (
          <Container>
            <CloseButton onClick={() => setShowForm(false)}>×</CloseButton>
            <FinancialGoal onGoalAdded={handleGoalAdded} />
          </Container>
        ) : (
          <FinancialGoalsDashboard
            goalAdded={goalAdded}
            setGoalAdded={setGoalAdded}
            onAddNewClick={handleAddNewClick} // Pass the handler for "Add New"
          />
        )}
      </Container>
    </>
  );
}

// Styled Components
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 20px;
  background: none;
  border: none;
  font-size: 3.5rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;

  &:hover {
    color: #ff4d4d; /* Red color on hover */
  }
`;