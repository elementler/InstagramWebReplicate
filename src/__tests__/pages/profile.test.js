import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { act } from "react-dom/test-utils";
import Profile from "../../pages/profile";
import UserContext from "../../context/user";
import LoggedInUserContext from "../../context/logged-in-user";
import FirebaseContext from "../../context/firebase";
import userFixture from "../../fixtures/logged-in-user";
import photosFixture from "../../fixtures/timeline-photos";
import profileThatIsFollowedByLoggedInUserFixture from "../../fixtures/profile-followed-by-logged-in-user";
import profileThatIsNotFollowedByLoggedInUserFixture from "../../fixtures/profile-not-followed-by-logged-in-user";
import {
    getUserByUsername,
    getUserPhotosByUserId,
    isUserFollowingProfile,
} from "../../services/firebase";
import useUser from "../../hooks/use-user";
import * as ROUTES from "../../constants/routes";

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ username: "orwell" }),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

jest.mock("../../services/firebase");
jest.mock("../../hooks/use-user");

describe("<Profile />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the profile page with a user profile", async () => {
        await act(async () => {
            getUserByUsername.mockImplementation(() =>
                Promise.resolve([profileThatIsFollowedByLoggedInUserFixture])
            );
            getUserPhotosByUserId.mockImplementation(() => Promise.resolve(photosFixture));
            useUser.mockImplementation(() => ({ user: userFixture }));

            const { getByAltText, getByTitle } = render(
                <Router>
                    <FirebaseContext.Provider
                        value={{
                            firebase: {
                                auth: jest.fn(() => ({
                                    signOut: jest.fn(() => Promise.resolve({})),
                                })),
                            },
                        }}
                    >
                        <UserContext.Provider
                            value={{
                                user: { uid: "wseC4EWsFBffgD4KyLqqcWryePH2", displayName: "xli" },
                            }}
                        >
                            <LoggedInUserContext.Provider value={{ user: userFixture }}>
                                <Profile />
                            </LoggedInUserContext.Provider>
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(mockHistoryPush).not.toHaveBeenCalled();
                expect(getUserByUsername).toHaveBeenCalledWith("orwell");
                expect(getByTitle("Sign Out")).toBeTruthy();
                expect(getByAltText("xli profile")).toBeTruthy();

                screen.getByText((content, node) => {
                    const hasText = (node) => node.textContent === "5 photos";
                    const nodeHasText = hasText(node);
                    const childrenDontHaveText = Array.from(node.children).every(
                        (child) => !hasText(child)
                    );

                    return nodeHasText && childrenDontHaveText;
                });
            });

            // sign the user out
            fireEvent.click(getByTitle("Sign Out"));
            expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.LOGIN);
            fireEvent.keyDown(getByTitle("Sign Out"), {
                key: "Enter",
            });
            expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.LOGIN);
        });
    });

    it("renders the profile page with a user profile and logged in and follows a user", async () => {
        await act(async () => {
            getUserByUsername.mockImplementation(() =>
                Promise.resolve([profileThatIsNotFollowedByLoggedInUserFixture])
            );
            isUserFollowingProfile.mockImplementation(() => false);
            useUser.mockImplementation(() => ({ user: userFixture }));
            profileThatIsNotFollowedByLoggedInUserFixture.followers = []; // reset followers
            getUserPhotosByUserId.mockImplementation(() => Promise.resolve(photosFixture));

            const { getByText, getByTitle } = render(
                <Router>
                    <FirebaseContext.Provider
                        value={{
                            firebase: {
                                auth: jest.fn(() => ({
                                    signOut: jest.fn(() => ({
                                        updateProfile: jest.fn(() => Promise.resolve({})),
                                    })),
                                })),
                            },
                        }}
                    >
                        <UserContext.Provider
                            value={{
                                user: {
                                    uid: "wseC4EWsFBffgD4KyLqqcWryePH2",
                                    displayName: "xli",
                                },
                            }}
                        >
                            <Profile />
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(mockHistoryPush).not.toHaveBeenCalledWith(ROUTES.NOT_FOUND);
                expect(getUserByUsername).toHaveBeenCalled();
                expect(getUserByUsername).toHaveBeenCalledWith("orwell");
                expect(getByTitle("Sign Out")).toBeTruthy();
                expect(getByText("orwell")).toBeTruthy();
                expect(getByText("George Orwell")).toBeTruthy();
                fireEvent.keyDown(getByText("Follow"), {
                    key: "Enter",
                });
            });
        });
    });

    it("renders the profile page with a user profile and logged in and unfollows a user", async () => {
        await act(async () => {
            getUserByUsername.mockImplementation(() =>
                Promise.resolve([profileThatIsFollowedByLoggedInUserFixture])
            );
            isUserFollowingProfile.mockImplementation(() => true);
            useUser.mockImplementation(() => ({ user: userFixture }));
            profileThatIsFollowedByLoggedInUserFixture.followers = []; // reset followers
            getUserPhotosByUserId.mockImplementation(() => Promise.resolve(photosFixture));

            const { getByText, getByTitle } = render(
                <Router>
                    <FirebaseContext.Provider
                        value={{
                            firebase: {
                                auth: jest.fn(() => ({
                                    signOut: jest.fn(() => ({
                                        updateProfile: jest.fn(() => Promise.resolve({})),
                                    })),
                                })),
                            },
                        }}
                    >
                        <UserContext.Provider
                            value={{
                                user: {
                                    uid: "wseC4EWsFBffgD4KyLqqcWryePH2",
                                    displayName: "xli",
                                },
                            }}
                        >
                            <Profile />
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(mockHistoryPush).not.toHaveBeenCalledWith(ROUTES.NOT_FOUND);
                expect(getUserByUsername).toHaveBeenCalled();
                expect(getUserByUsername).toHaveBeenCalledWith("orwell");
                expect(getByTitle("Sign Out")).toBeTruthy();
                expect(getByText("orwell")).toBeTruthy();
                expect(getByText("George Orwell")).toBeTruthy();
                fireEvent.keyDown(getByText("Unfollow"), {
                    key: "Enter",
                });
            });
        });
    });

    it("renders the profile page but there is no user so redirect happens", async () => {
        await act(async () => {
            getUserByUsername.mockImplementation(() => Promise.resolve([]));
            useUser.mockImplementation(() => ({ user: userFixture }));
            getUserPhotosByUserId.mockImplementation(() => Promise.resolve([]));

            render(
                <Router>
                    <FirebaseContext.Provider value={{}}>
                        <UserContext.Provider
                            value={{
                                user: {
                                    uid: "wseC4EWsFBffgD4KyLqqcWryePH2",
                                    displayName: "xli",
                                },
                            }}
                        >
                            <Profile />
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.NOT_FOUND);
            });
        });
    });
});
