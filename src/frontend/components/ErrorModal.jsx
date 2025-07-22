import React from "react";
import { Modal, Text, Button } from "@mantine/core";

const ErrorModal = ({ opened, message, onClose }) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Error">
      <Text c="red">{message}</Text>
      <Button mt="md" onClick={onClose} fullWidth>
        OK
      </Button>
    </Modal>
  );
};

export default ErrorModal;