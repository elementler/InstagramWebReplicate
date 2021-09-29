import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { act } from "react-dom/test-utils";
import Dashboard from "../../pages/dashboard";
import UserContext from "../../context/user";
import LoggedInUserContext from "../../context/logged-in-user";
import FirebaseContext from "../../context/firebase";
import userFixture from "../../fixtures/logged-in-user";
import photosFixture from "../../fixtures/timeline-photos";
import suggestedProfilesFixture from "../../fixtures/suggested-profiles";
import { getPhotos, getSuggestedProfiles, getUserByUserId } from "../../services/firebase";
import useUser from "../../hooks/use-user";
import usePhotos from "../../hooks/use-photos";

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

jest.mock("../../services/firebase");
jest.mock("../../hooks/use-user");

describe("<Dashboard />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the dashboard with a user profile and follows a user from the suggested profile sidebar", async () => {
        await act(async () => {
            getPhotos.mockImplementation(() => photosFixture);
            getSuggestedProfiles.mockImplementation(() => suggestedProfilesFixture);
            getUserByUserId.mockImplementation(() => Promise.resolve([userFixture]));
            useUser.mockImplementation(() => ({ user: userFixture }));

            const firebase = {
                firestore: jest.fn(() => ({
                    collection: jest.fn(() => ({
                        doc: jest.fn(() => ({
                            update: jest.fn(() => Promise.resolve("User Updated")),
                        })),
                    })),
                })),
            };
            const FieldValue = {
                arrayUnion: jest.fn(),
                arrayRemove: jest.fn(),
            };

            const { getAllByText, getByAltText, getByTestId, getByText, getByTitle } = render(
                <Router>
                    <FirebaseContext.Provider value={{ firebase, FieldValue }}>
                        <UserContext.Provider
                            value={{
                                user: { uid: "wseC4EWsFBffgD4KyLqqcWryePH2", displayName: "xli" },
                            }}
                        >
                            <LoggedInUserContext.Provider value={{ user: userFixture }}>
                                <Dashboard
                                    user={{
                                        uid: "wseC4EWsFBffgD4KyLqqcWryePH2",
                                        displayName: "xli",
                                    }}
                                />
                            </LoggedInUserContext.Provider>
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(document.title).toEqual("Instagram");
                expect(getByTitle("Sign Out")).toBeTruthy();
                expect(getAllByText("raphael")).toBeTruthy();
                expect(getByAltText("Instagram Replicate")).toBeTruthy();
                expect(getByAltText("xli profile")).toBeTruthy();
                expect(getAllByText("Saint George and the Dragon")).toBeTruthy();
                expect(getByText("Suggestions for you")).toBeTruthy();

                // following the user
                fireEvent.click(getByText("Follow"));
                // regular click
                fireEvent.click(getByTestId("like-photo-MYv4fLT7DZpuFAkcZB3P"));
                // toggle like using keyboard
                fireEvent.keyDown(getByTestId("like-photo-MYv4fLT7DZpuFAkcZB3P"), {
                    key: "Enter",
                });
                fireEvent.click(getByTestId("focus-input-MYv4fLT7DZpuFAkcZB3P"));
                fireEvent.keyDown(getByTestId("focus-input-MYv4fLT7DZpuFAkcZB3P"), {
                    key: "Enter",
                });

                // add a comment to a photo on the dashboard
                fireEvent.change(getByTestId("add-comment-MYv4fLT7DZpuFAkcZB3P"), {
                    target: { value: "Amazing photo!" },
                });

                fireEvent.submit(getByTestId("add-comment-submit-MYv4fLT7DZpuFAkcZB3P"));

                // attempt to submit a comment with an invalid string length
                fireEvent.change(getByTestId("add-comment-MYv4fLT7DZpuFAkcZB3P"), {
                    target: { value: "" },
                });

                fireEvent.submit(getByTestId("add-comment-submit-MYv4fLT7DZpuFAkcZB3P"));
            });
        });
    });

    it("renders the dashboard with a user profile of undefined", async () => {
        await act(async () => {
            getPhotos.mockImplementation(() => photosFixture);
            getSuggestedProfiles.mockImplementation(() => suggestedProfilesFixture);
            getUserByUserId.mockImplementation(() => Promise.resolve([userFixture]));
            useUser.mockImplementation(() => ({ user: undefined }));

            const firebase = {
                firestore: jest.fn(() => ({
                    collection: jest.fn(() => ({
                        doc: jest.fn(() => ({
                            update: jest.fn(() => Promise.resolve({})),
                        })),
                    })),
                })),
            };

            const { getByText, queryByText } = render(
                <Router>
                    <FirebaseContext.Provider value={{ firebase }}>
                        <UserContext.Provider
                            value={{
                                user: { uid: "" },
                            }}
                        >
                            <LoggedInUserContext.Provider value={{ user: userFixture }}>
                                <Dashboard
                                    user={{
                                        uid: "wseC4EWsFBffgD4KyLqqcWryePH2",
                                        displayName: "xli",
                                    }}
                                />
                            </LoggedInUserContext.Provider>
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            expect(getByText("Log In")).toBeTruthy();
            expect(getByText("Sign Up")).toBeTruthy();
            expect(queryByText("Suggestions for you")).toBeFalsy();
        });
    });
});
