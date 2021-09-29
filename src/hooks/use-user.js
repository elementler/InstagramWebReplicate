import { useEffect, useState } from "react";
import { getUserByUserId } from "../services/firebase";

export default function useUser(userId) {
    const [activeUser, setActiveUser] = useState({});

    useEffect(() => {
        async function getUserObjByUserId(userId) {
            // Need a function that calls firebase service to get the user data based on the id
            const [user] = await getUserByUserId(userId);
            setActiveUser(user || {});
        }

        if (userId) {
            getUserObjByUserId(userId);
        }
    }, [userId]);

    return { user: activeUser, setActiveUser };
}
