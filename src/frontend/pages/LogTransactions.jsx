import React, { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Container,
  Card,
  Table,
  Stack,
  Group,
  Title,
  Button,
  Autocomplete,
  Modal,
  Combobox,
  useCombobox,
  Input,
  InputBase,
  NumberInput,
  Text
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IoIosClose } from "react-icons/io";
import ErrorModal from "../components/ErrorModal";

// LogTransactions Component
const LogTransactions = () => {
  const { ipcRenderer } = window.electron;

  //Actual data from the backend
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Modal values
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");

  //Modal
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  // Error Modal State
  const [errorModalOpened, { open: openErrorModal, close: closeErrorModal }] =
    useDisclosure(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Delete Modal State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Handle transaction double-click for editing
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setName(transaction.dataValues.name);
    setDate(new Date(transaction.dataValues.date));
    setStatusValue(transaction.dataValues.status);
    setAmount(transaction.dataValues.amount);
    setEditMode(true);
    openModal();
  };

  // Delete transaction
  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      await ipcRenderer.invoke("delete-transaction", deleteTransactionId);
      fetchTransactions(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setErrorMessage("Failed to delete transaction.");
      openErrorModal();
    } finally {
      closeDeleteModal();
    }
  };

  // Open delete confirmation modal
  const confirmDeleteTransaction = (transactionId) => {
    setDeleteTransactionId(transactionId);
    openDeleteModal();
  };

  // Save or update transaction
  const handleSaveTransaction = async () => {
    const formattedDate = new Date(date).toLocaleDateString("en-CA");
    const transactionData = {
      name: name,
      date: formattedDate,
      status: statusValue,
      amount,
    };

    if (editMode && editingTransaction) {
      // Update existing transaction
      transactionData.id = editingTransaction.dataValues.id;
      await ipcRenderer.invoke("update-transaction", transactionData.id, transactionData);
    } else {
      // Create new transaction
      await saveTransaction(transactionData);
    }

    fetchTransactions();
    closeModal();
    resetModalValues();
    setEditMode(false);
  };

  //Status combobox
  const statusData = ["Income", "Expense"];
  const statusCombobox = useCombobox({
    onDropdownClose: () => statusCombobox.resetSelectedOption(),
  });
  const [statusValue, setStatusValue] = useState("");
  const statusOptions = statusData.map((status) => (
    <Combobox.Option key={status} value={status}>
      {status}
    </Combobox.Option>
  ));

  const fetchTransactions = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke(
        "get-transactions"
      );
      console.log("Response from IPC:", response); // Debugging

      // Ensure transactions is an array
      setTransactions(
        Array.isArray(response.transactions) ? response.transactions : []
      );
    } catch (err) {
      setError("Failed to fetch transactions.");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  //Fetch transactions from the backend (IPC)
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Save transaction to the database
  const saveTransaction = async (transactionData) => {
    try {
      const response = await ipcRenderer.invoke(
        "create-transaction",
        transactionData
      );
      if (response.error) {
        setErrorMessage(`Error: ${response.error}`);
        openErrorModal()
      }

    } catch (error) {
      console.error("Error saving transaction:", error);
      setErrorMessage(`Error saving transaction: ${error.message}`);
      openErrorModal();
    }
  };

  // Reset all values to their initial state after the modal closes
  const resetModalValues = () => {
    setName("");
    setAmount(0);
    setDate("");
    setStatusValue("");
  };

  return (
    <>
      <Container size="xl">
        <Card bg="green.6">
          <Stack>
            <Title mb="md" c="white" order={1}>Transaction Logs</Title>
            <Group justify="space-between">
              <Group>
                <Autocomplete placeholder="Search"></Autocomplete>
                <Button c="white" color="green.7"><Text>Action</Text></Button>
                <Button c="white" color="green.7"><Text>Filter</Text></Button>
              </Group>
              <Group>
                <Button c="white" color="green.7" onClick={openModal}>
                  <Text>Add New</Text>
                </Button>
              </Group>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th><Text fw="bold" span>ID.</Text></Table.Th>
                  <Table.Th><Text fw="bold" span>Name</Text></Table.Th>
                  <Table.Th><Text fw="bold" span>Date</Text></Table.Th>
                  <Table.Th> <Text fw="bold" span>Status</Text></Table.Th>
                  <Table.Th><Text fw="bold" span>Amount</Text></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transactions.length === 0 ?
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text mt="md" align="center">No transactions found.</Text>
                    </Table.Td>
                  </Table.Tr>
                  : transactions.map((transaction, index) => (
                    <Table.Tr key={index} onDoubleClick={() => handleEditTransaction(transaction)} style={{
                      cursor: "pointer", transition: "background 0.2s ease-in-out",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--mantine-color-green-3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <Table.Td><Text span>{transaction.dataValues.id}</Text></Table.Td>
                      <Table.Td><Text span>{transaction.dataValues.name}</Text></Table.Td>
                      <Table.Td><Text span>{transaction.dataValues.date}</Text></Table.Td>
                      <Table.Td><Text span>{transaction.dataValues.status}</Text></Table.Td>
                      <Table.Td><Text span>${transaction.dataValues.amount}</Text></Table.Td>
                      <Table.Td>
                        <Button variant="subtle" color="red" size="xs" onClick={(e) => {
                          e.stopPropagation(); // Prevent row double-click from triggering edit
                          console.log("Delete transaction:", transaction.dataValues.id); // Debugging
                          confirmDeleteTransaction(transaction.dataValues.id);
                        }}>
                          <IoIosClose size={20} />
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Card>

        <Modal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          title="Confirm Deletion"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <Text>Are you sure you want to delete this transaction?</Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteTransaction}>
              Delete
            </Button>
          </Group>
        </Modal>


        <ErrorModal
          opened={errorModalOpened}
          message={errorMessage}
          onClose={() => closeErrorModal()}
        />

        <Modal
          opened={modalOpened}
          onClose={() => {
            setEditMode(false);
            setEditingTransaction(null);
            closeModal();
            resetModalValues();
          }}
          title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <Stack align="center">
            <Autocomplete
              w="100%"
              placeholder="Name"
              value={name}
              onChange={setName}
            />
            <DatePicker placeholder="Date" value={date} onChange={setDate} />
            <Combobox
              store={statusCombobox}
              onOptionSubmit={(val) => {
                setStatusValue(val);
                statusCombobox.closeDropdown();
              }}
              w="100%"
            >
              <Combobox.Target>
                <InputBase
                  component="button"
                  type="button"
                  pointer
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  onClick={() => statusCombobox.toggleDropdown()}
                >
                  {statusValue || <Input.Placeholder>Status</Input.Placeholder>}
                </InputBase>
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>{statusOptions}</Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
            <NumberInput
              w="100%"
              placeholder="Amount"
              prefix="$"
              value={amount}
              onChange={setAmount}
            />
            <Button
              color="green"
              onClick={() => handleSaveTransaction()}
            >
              {editMode ? "Update" : "Save"}
            </Button>
          </Stack>
        </Modal>
      </Container>
    </>
  );
};

export default LogTransactions;