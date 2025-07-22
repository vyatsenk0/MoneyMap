import React, { useState, useRef, useEffect } from "react";
import { Tooltip, Container, Flex, ScrollArea, Textarea, Button, Group, Stack, Loader, Text, Card, Drawer, Modal } from '@mantine/core';
import { FaTrash } from 'react-icons/fa';
import { IoSend } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { notifications } from "@mantine/notifications";

import classes from "../../styles/Chat.module.css";

export default function Chat() {
    const { ipcRenderer } = window.electron;

    const initialMessage = {
        role: "assistant",
        content: "Hi! I'm your MoneyMap assistant. How can I help you today?",
    };

    const initialData = async () => {
        let data = await ipcRenderer.invoke("export-json");

        return {
            role: "system",
            content: JSON.stringify(data.data)
        }
    };

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [savedChats, setSavedChats] = useState({});
    const [drawerOpened, setDrawerOpened] = useState(false); // State to control the drawer visibility
    const [deleteModalOpened, setDeleteModalOpened] = useState(false); // Modal visibility for delete
    const [chatIdToDelete, setChatIdToDelete] = useState(null); // Store the chatId to delete

    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("savedChats")) || {};
        setSavedChats(saved);

        const wasActive = sessionStorage.getItem("activeChatId");
        if (wasActive && saved[wasActive]) {
            setMessages(saved[wasActive]);
            setChatId(wasActive);
        } else {
            const newId = Date.now().toString();
            setMessages([initialMessage]);
            setChatId(newId);
        }
    }, []);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const loadInitialData = await initialData();
        console.log(loadInitialData)
        const newMessages = [...messages, loadInitialData, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("https://moneymap.fadaei.dev/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer supersecret123",
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            const aiMessage = {
                role: "assistant",
                content:
                    typeof data === "string"
                        ? data
                        : data.output || "Sorry, something went wrong.",
            };

            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);

            const updatedChats = {
                ...savedChats,
                [chatId]: updatedMessages,
            };
            setSavedChats(updatedChats);
            localStorage.setItem("savedChats", JSON.stringify(updatedChats));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        const newId = Date.now().toString();
        setMessages([initialMessage]);
        setInput("");
        setChatId(newId);
        sessionStorage.setItem("activeChatId", newId);
    };

    const loadChat = (id) => {
        setChatId(id);
        setMessages(savedChats[id]);
        sessionStorage.setItem("activeChatId", id);
    };

    const saveChatManually = () => {
        const updatedChats = {
            ...savedChats,
            [chatId]: messages,
        };
        setSavedChats(updatedChats);
        localStorage.setItem("savedChats", JSON.stringify(updatedChats));
        notifications.show({
            color: "green",
            title: "Saved Successfully",
            message: "Chat saved locally!",
        });
    };

    // Modal confirmation for delete chat
    const confirmDeleteChat = () => {
        if (chatIdToDelete) {
            const updatedChats = { ...savedChats };
            delete updatedChats[chatIdToDelete];
            setSavedChats(updatedChats);
            localStorage.setItem("savedChats", JSON.stringify(updatedChats));

            if (chatId === chatIdToDelete) {
                sessionStorage.removeItem("activeChatId");
                startNewChat();
            }
        }
        closeDeleteModal();
    };

    const openDeleteModal = (id) => {
        setChatIdToDelete(id);
        setDeleteModalOpened(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpened(false);
        setChatIdToDelete(null);
    };

    return (
        <Container size="xl">
            <Flex direction="column" h="100%" ff="var(--mantine-font-family, sans-serif)">
                {/* Chat Area */}
                <ScrollArea h="100%" p="md" mb={12} scrollbarSize={6}>
                    {messages.map((msg, index) => (
                        <Card
                            key={index}
                            c="var(--mantine-color-gray-3)"
                            alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                            className={`${classes.messagePaper} ${msg.role === 'user' ? classes.userMessage : classes.assistantMessage
                                } ${msg.role === 'system' ? classes.hidden : ''}`}
                        >
                            {msg.role === "assistant" ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </Card>
                    ))}
                    {loading && <Loader size="lg" color="green.0" type="dots" />}
                    <div ref={endOfMessagesRef} />
                </ScrollArea>

                <Textarea
                    autosize
                    size="xl"
                    radius="xl"
                    classNames={{ section: classes.textareaSection, input: classes.textareaInput }}
                    minRows={2}
                    maxRows={7}
                    placeholder="Ask anything about your finances..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    rightSection={
                        <IoSend
                            size={22}
                            color="var(--mantine-color-blue-5)"
                            onClick={sendMessage}
                            style={{ cursor: "pointer" }}
                            disabled={loading}
                        />
                    }
                    styles={{ input: { overflow: "hidden" } }}
                    className={classes.textarea}
                />

                <Group justify="flex-end" spacing="sm" mt={12}>
                    <Tooltip label="Save Chat" position="top" withArrow>
                        <Button color="white" variant="subtle" onClick={saveChatManually}>
                            <FaSave size={20} />
                        </Button>
                    </Tooltip>

                    <Tooltip label="Show Saved Chats" position="top" withArrow>
                        <Button color="white" variant="subtle" onClick={() => setDrawerOpened(true)}>
                            <FaHistory size={20} />
                        </Button>
                    </Tooltip>
                </Group>

                {/* Saved Chats Drawer */}
                <Drawer
                    opened={drawerOpened}
                    onClose={() => setDrawerOpened(false)}
                    title="Saved Chats"
                    padding="lg"
                    size="sm"
                    position="right"
                    overlayProps={{ opacity: 0.5, blur: 4 }}
                >
                    <Button mb="md" onClick={() => { startNewChat(); setDrawerOpened(false); }} className={classes.newChatButton}>New Chat</Button>
                    {Object.keys(savedChats).length === 0 ? (
                        <Text>No saved chats.</Text>
                    ) : (
                        <Stack spacing="sm">
                            {Object.entries(savedChats).map(([id, msgs]) => (
                                <Group key={id} spacing="xs">
                                    <Button
                                        onClick={() => loadChat(id)}
                                        variant={id === chatId ? 'filled' : 'outline'}
                                        className={classes.savedChatButton}
                                    >
                                        {new Date(Number(id)).toLocaleString()}
                                    </Button>
                                    <Button
                                        onClick={() => openDeleteModal(id)}
                                        variant="subtle"
                                        color="red"
                                        className={classes.deleteChatButton}
                                        title="Delete Chat"
                                    >
                                        <FaTrash size={16} />
                                    </Button>
                                </Group>
                            ))}
                        </Stack>
                    )}
                </Drawer>

                {/* Modal Confirmation for Deleting a Chat */}
                <Modal
                    opened={deleteModalOpened}
                    onClose={closeDeleteModal}
                    title="Confirm Deletion"
                    overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 3,
                    }}
                >
                    <Text>Are you sure you want to delete this chat?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDeleteModal}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={confirmDeleteChat}>
                            Delete
                        </Button>
                    </Group>
                </Modal>
            </Flex>
        </Container>
    );
}
