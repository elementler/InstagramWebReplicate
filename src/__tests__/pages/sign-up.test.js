import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import SignUp from "../../pages/sign-up";
import FirebaseContext from "../../context/firebase";
import * as ROUTES from "../../constants/routes";
import { doesUsernameExist } from "../../services/firebase";

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

jest.mock("../../services/firebase");

describe("<SignUp />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the sign up page with a form submission and signs a user up", async () => {
        const firebase = {
            firestore: jest.fn(() => ({
                collection: jest.fn(() => ({
                    add: jest.fn(() => Promise.resolve("User added")),
                })),
            })),
            auth: jest.fn(() => ({
                createUserWithEmailAndPassword: jest.fn(() => ({
                    user: { updateProfile: jest.fn(() => Promise.resolve("I am signed up!")) },
                })),
            })),
        };

        const { getByTestId, getByPlaceholderText, queryByTestId } = render(
            <Router>
                <FirebaseContext.Provider value={{ firebase }}>
                    <SignUp />
                </FirebaseContext.Provider>
            </Router>
        );

        await act(async () => {
            doesUsernameExist.mockImplementation(() => Promise.resolve(false)); // as true but inverse in the code

            await fireEvent.change(getByPlaceholderText("Username"), {
                target: { value: "xli" },
            });
            await fireEvent.change(getByPlaceholderText("Full Name"), {
                target: { value: "Xavier Li" },
            });
            await fireEvent.change(getByPlaceholderText("Email Address"), {
                target: { value: "xavierli@gmail.com" },
            });
            await fireEvent.change(getByPlaceholderText("Password"), {
                target: { value: "test-password" },
            });
            fireEvent.submit(getByTestId("sign-up"));

            expect(document.title).toEqual("Sign Up - Instagram");
            expect(doesUsernameExist).toHaveBeenCalled();
            expect(doesUsernameExist).toHaveBeenCalledWith("xli");

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.DASHBOARD);
                expect(getByPlaceholderText("Username").value).toBe("xli");
                expect(getByPlaceholderText("Full Name").value).toBe("Xavier Li");
                expect(getByPlaceholderText("Email Address").value).toBe("xavierli@gmail.com");
                expect(getByPlaceholderText("Password").value).toBe("test-password");
                expect(queryByTestId("error")).toBeFalsy();
            });
        });
    });

    it("renders the sign up page but an error is present", async () => {
        const firebase = {
            auth: jest.fn(() => ({
                createUserWithEmailAndPassword: jest.fn(() => ({
                    user: { updatedProfile: jest.fn(() => Promise.resolve({})) },
                })),
            })),
        };

        const { getByTestId, getByPlaceholderText, queryByTestId } = render(
            <Router>
                <FirebaseContext.Provider value={{ firebase }}>
                    <SignUp />
                </FirebaseContext.Provider>
            </Router>
        );

        await act(async () => {
            doesUsernameExist.mockImplementation(() => Promise.resolve(true));

            await fireEvent.change(getByPlaceholderText("Username"), {
                target: { value: "xli" },
            });
            await fireEvent.change(getByPlaceholderText("Full Name"), {
                target: { value: "Xavier Li" },
            });
            await fireEvent.change(getByPlaceholderText("Email Address"), {
                target: { value: "xavierli@gmail.com" },
            });
            await fireEvent.change(getByPlaceholderText("Password"), {
                target: { value: "test-password" },
            });
            fireEvent.submit(getByTestId("sign-up"));

            expect(document.title).toEqual("Sign Up - Instagram");
            expect(doesUsernameExist).toHaveBeenCalled();
            expect(doesUsernameExist).toHaveBeenCalledWith("xli");

            await waitFor(() => {
                expect(mockHistoryPush).not.toHaveBeenCalledWith(ROUTES.DASHBOARD);
                expect(getByPlaceholderText("Username").value).toBe("");
                expect(getByPlaceholderText("Full Name").value).toBe("Xavier Li");
                expect(getByPlaceholderText("Email Address").value).toBe("xavierli@gmail.com");
                expect(getByPlaceholderText("Password").value).toBe("");
                expect(queryByTestId("error")).toBeTruthy();
            });
        });
    });

    it("renders the sign up page but an error is thrown", async () => {
        const firebase = {
            auth: jest.fn(() => ({
                createUserWithEmailAndPassword: jest.fn(() => ({
                    user: { updatedProfile: jest.fn(() => Promise.reject(new Error("Error"))) },
                })),
            })),
        };

        const { getByTestId, getByPlaceholderText, queryByTestId } = render(
            <Router>
                <FirebaseContext.Provider value={{ firebase }}>
                    <SignUp />
                </FirebaseContext.Provider>
            </Router>
        );

        await act(async () => {
            doesUsernameExist.mockImplementation(() => Promise.resolve(false));

            await fireEvent.change(getByPlaceholderText("Username"), {
                target: { value: "xli" },
            });
            await fireEvent.change(getByPlaceholderText("Full Name"), {
                target: { value: "Xavier Li" },
            });
            await fireEvent.change(getByPlaceholderText("Email Address"), {
                target: { value: "xavierli@gmail.com" },
            });
            await fireEvent.change(getByPlaceholderText("Password"), {
                target: { value: "test-password" },
            });
            fireEvent.submit(getByTestId("sign-up"));

            expect(document.title).toEqual("Sign Up - Instagram");
            expect(doesUsernameExist).toHaveBeenCalled();
            expect(doesUsernameExist).toHaveBeenCalledWith("xli");

            await waitFor(() => {
                expect(mockHistoryPush).not.toHaveBeenCalledWith(ROUTES.DASHBOARD);
                expect(getByPlaceholderText("Username").value).toBe("");
                expect(getByPlaceholderText("Full Name").value).toBe("");
                expect(getByPlaceholderText("Email Address").value).toBe("");
                expect(getByPlaceholderText("Password").value).toBe("");
                expect(queryByTestId("error")).toBeTruthy();
            });
        });
    });
});
