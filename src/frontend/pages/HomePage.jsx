import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Text,
  Progress,
  List,
  ThemeIcon,
  Divider,
  Container,
  Loader,
  Stack,
  Title,
  alpha,
  Image,
  Group
} from "@mantine/core";
import { IconCheck, IconTrendingDown } from "@tabler/icons-react";
import styled from "styled-components";
import { FaCheck } from "react-icons/fa";

import logoImg from "/public/images/logo.png"

const ProgressBar = styled(Progress)`
  margin-top: 10px;
`;

const HomePage = () => {
  const { ipcRenderer } = window.electron;
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const message = await ipcRenderer.invoke("export-json");

        const res = await fetch("https://moneymap.fadaei.dev/api/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer supersecret123",
          },
          body: JSON.stringify({ message: JSON.stringify(message.data) }),
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        if (isMounted) setData(json);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);


  if (!data) return <Flex w="100%" h="100%" justify="center" align="center"><Stack justify="center" align="center"><Loader type="bars" size="xl" /><Text c="white">Loading, please wait...</Text></Stack></Flex>;

  return (
    <>
      <Container size="xl">
        <Group justify="center"><Image src={logoImg} fit="cover" w="35rem" alt="Logo" mb="md" /></Group>
        <Title c="white" order={4}>
          Track, manage, and grow your finances effortlessly.
        </Title>

        <Stack gap="xl" mt="3rem">
          <Card bg={alpha("var(--mantine-color-white)", 0.15)} radius="md" shadow="sm">
            <Title c="white" order={1} mb="md">Financial Summary</Title>
            <Stack gap="md">
              <Text c="white">Total Income: <Text inherit span fw="bolder">${data.financial_summary.total_income}</Text></Text>
              <Text c="white">Total Expenses: <Text inherit span fw="bolder">${data.financial_summary.total_expenses}</Text></Text>
              <Text c="white">Net Balance: <Text inherit span fw="bolder">${data.financial_summary.net_balance}</Text></Text>
            </Stack>

            <Divider my="sm" />

            <Title c="white" order={1} mb="md">Spending Comparison</Title>
            {data.financial_summary.spending_comparison.map((item) => (
              <Flex
                key={item.category_name}
                justify="space-between"
                align="center"
                mb="sm"
              >
                <Text c="white">{item.category_name}</Text>
                <Text fw="bolder" c={item.over_budget ? "var(--mantine-color-red-9)" : "var(--mantine-color-green-9)"}>
                  ${item.actual} / ${item.budgeted}
                </Text>
              </Flex>
            ))}
          </Card>

          <Card bg={alpha("var(--mantine-color-white)", 0.15)} radius="md" shadow="sm">
            <Title c="white" order={1} mb="md">Recurring Expenses</Title>
            <Text c="white">
              Total Monthly Recurring: <Text inherit span fw="bolder">$
                {data.recurring_expense_analysis.total_recurring_monthly}</Text>
            </Text>
            {data.recurring_expense_analysis.recurring_expenses.map((item) => (
              <Text c="white" key={item.name}>
                • {item.name}:  <Text inherit span fw="bolder">${item.expense}</Text>
              </Text>
            ))}
          </Card>

          <Card bg={alpha("var(--mantine-color-white)", 0.15)} radius="md" shadow="sm">
            <Title c="white" order={1} mb="md">Financial Goals</Title>
            {data.financial_goals_analysis.goals_progress.map((goal) => (
              <Card key={goal.name} bg="green.4" shadow="sm" radius="md" p="sm" mt="sm">
                <Text>{goal.name}</Text>
                <Text size="sm">
                  Target: ${goal.targetAmount} | Time Left: {goal.timeLeft} months
                </Text>
                <ProgressBar
                  value={goal.progress}
                  size="lg"
                  color={goal.progress < 50 ? "red" : "green"}
                />
              </Card>
            ))}
          </Card>

          <Card bg={alpha("var(--mantine-color-white)", 0.15)} radius="md" shadow="sm">
            <Title c="white" order={1} mb="md">Financial Recommendations</Title>

            <List spacing="sm" size="sm" icon={<ThemeIcon color="teal" size={24} radius="xl"><FaCheck size={16} /></ThemeIcon>}>
              {data.financial_recommendations.map((rec, index) => (
                <List.Item key={index}>
                  <Text c="white">{rec}</Text>
                </List.Item>
              ))}
              <List.Item icon={<ThemeIcon color="red" size={24} radius="xl">
                <IconTrendingDown size="1rem" />
              </ThemeIcon>}>
                <Text c="white">You should review your spending habits on unnecessary subscriptions.</Text>
              </List.Item>
            </List>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default HomePage;
