import React, { useState } from "react";
import styled from "styled-components";
import { Container, Card, Title, Grid, Input, Checkbox, Button, Text, Select, Stack, NumberInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

function FinancialGoal({ onGoalAdded }) {
  const { ipcRenderer } = window.electron;

  // **State Hooks for Form Fields**
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [errors, setErrors] = useState({});
  const [customCategory, setCustomCategory] = useState("");

  const validate = () => {
    let newErrors = {};
    if (!goalName) newErrors.goalName = "Goal name is required.";
    if (!targetAmount || parseFloat(targetAmount) <= 0) newErrors.targetAmount = "Target amount must be greater than 0.";
    if (!category) {
      newErrors.category = "Category is required.";
    } else if (category === "custom" && !customCategory) {
      newErrors.customCategory = "Custom category is required.";
    }
    if (recurring) {
      if (!incomeAmount || parseFloat(incomeAmount) <= 0) newErrors.incomeAmount = "Income amount is required and must be positive.";
      if (!frequency) newErrors.frequency = "Frequency is required.";
    }
    if (!targetDate) {
      newErrors.targetDate = "Target date is required.";
    } else if (new Date(targetDate) < new Date()) {
      newErrors.targetDate = "Target date cannot be in the past.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveGoal = async () => {
    if (!validate()) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Please fix the input errors to save your goal",
      });
      return;
    }

    const goalCategory = customCategory ? customCategory : category;

    const goalData = {
      name: goalName,
      targetAmount: parseFloat(targetAmount) || 0,
      category: goalCategory,
      recurring,
      incomeAmount: recurring ? parseFloat(incomeAmount) || 0 : null,
      frequency: recurring ? frequency : null,
      targetDate,
    };

    try {
      const response = await ipcRenderer.invoke("create-goal", goalData);
      if (response.error) {
        notifications.show({
          color: "red",
          title: "Error",
          message: response.error,
        });
      } else {
        notifications.show({
          color: "green",
          title: "Success",
          message: "Goal saved successfully!",
        });

        // Reset form after success
        setGoalName("");
        setTargetAmount("");
        setCategory("");
        setRecurring(false);
        setIncomeAmount("");
        setFrequency("");
        setTargetDate("");

        onGoalAdded(); // Trigger update
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "An error occurred while saving the goal.",
      });
    }
  };

  return (
    <Card bg="green.6">
      <Title order={2} align="center" mb="lg" color="#397d2c">
        Create New Financial Goal
      </Title>

      <Grid gutter="xl">
        {/* First Column */}
        <Grid.Col span={4}>
          <Stack spacing="md">
            {errors.goalName && <ErrorText>{errors.goalName}</ErrorText>}
            <Input
              type="text"
              placeholder="Goal Name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
            {errors.targetAmount && <ErrorText>{errors.targetAmount}</ErrorText>}
            <NumberInput
              type="text"
              placeholder="Target Amount"
              value={targetAmount}
              onChange={setTargetAmount}
            />
            {errors.category && <ErrorText>{errors.category}</ErrorText>}
            <Select
              value={category}
              onChange={setCategory}
              placeholder="Select Category"
              data={[
                { value: "savings", label: "Savings" },
                { value: "investment", label: "Investment" },
                { value: "emergency", label: "Emergency Fund" },
                { value: "custom", label: "Custom" },
              ]}
            />
            {category === "custom" && (
              <Input
                type="text"
                placeholder="Enter Custom Category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}
            {errors.customCategory && <ErrorText>{errors.customCategory}</ErrorText>}
          </Stack>
        </Grid.Col>

        {/* Second Column */}
        <Grid.Col span={4}>
          <Stack spacing="md">
            <Checkbox
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              label="Enable Automatic Recurring Contributions"
            />
            {recurring && errors.incomeAmount && <ErrorText>{errors.incomeAmount}</ErrorText>}
            <Input
              type="number"
              placeholder="Amount of Income"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
              disabled={!recurring}
            />
            {recurring && errors.frequency && <ErrorText>{errors.frequency}</ErrorText>}
            <Select
              value={frequency}
              onChange={setFrequency}
              placeholder="Select Frequency"
              disabled={!recurring}
              data={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
              ]}
            />
          </Stack>
        </Grid.Col>

        {/* Third Column */}
        <Grid.Col span={4}>
          <Stack spacing="md">
            {errors.targetDate && <ErrorText>{errors.targetDate}</ErrorText>}
            <Text size="sm" align="center">
              Target Date
            </Text>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Button Section */}
      <Button c="white" variant="subtle" mt="md" fullWidth color="green.9" onClick={saveGoal}>Save New Goal</Button>
    </Card>
  );
}

export default FinancialGoal;

const ErrorText = styled(Text)`
  color: red;
  font-size: 0.9rem;
`;