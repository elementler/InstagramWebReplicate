import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";
import { getUserByUserId } from "../../services/firebase";
import userFixture from "../../fixtures/logged-in-user";
import NotFound from "../../pages/not-found";
import { act } from "react-dom/test-utils";

jest.mock("../../services/firebase");

describe("<NotFound />", () => {
    it("renders the not found page with a logged in user", async () => {
        await act(async () => {
            getUserByUserId.mockImplementation(() => Promise.resolve({ user: userFixture }));

            const { queryByText, debug } = render(
                <Router>
                    <FirebaseContext.Provider value={{}}>
                        <UserContext.Provider value={{ user: { uid: 1 } }}>
                            <NotFound />
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(queryByText("Log In")).toBeFalsy();
                expect(queryByText("Not Found!")).toBeTruthy();
            });
        });
    });

    it("renders the not found page with an anonymous user", async () => {
        await act(async () => {
            getUserByUserId.mockImplementation(() => Promise.resolve({}));

            const { queryByText } = render(
                <Router>
                    <FirebaseContext.Provider value={{}}>
                        <UserContext.Provider value={{}}>
                            <NotFound />
                        </UserContext.Provider>
                    </FirebaseContext.Provider>
                </Router>
            );

            await waitFor(() => {
                expect(queryByText("Log In")).toBeTruthy();
                expect(queryByText("Not Found!")).toBeTruthy();
            });
        });
    });
});
