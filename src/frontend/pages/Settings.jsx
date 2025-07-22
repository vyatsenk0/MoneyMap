import React, { useState } from "react";

import { Container, Title, Flex, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

const Settings = () => {
  const { ipcRenderer } = window.electron;


  const handleExport = async () => {
    try {
      await ipcRenderer.invoke("export-json");

      notifications.show({
        title: "Export Successful",
        message: "Data exported successfully!",
        color: "green",
      });

    } catch (error) {
      console.error("Error exporting data:", error);

      notifications.show({
        title: "Export Failed",
        message: "Failed to export data.",
        color: "red",
      });
    }
  };

  return (
    <>
      <Container pos="relative" style={{ zIndex: 1 }}>
        <Title c="white" mb="md">Settings</Title>
        <Button onClick={handleExport}>Export Data to JSON</Button>
      </Container>
    </>
  );
};

export default Settings;