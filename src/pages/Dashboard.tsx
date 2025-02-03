import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
    const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<{ firstname: string; lastname: string; email: string; _id: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ firstname: string; lastname: string; email: string; _id: string } | null>(null);
    const [amount, setAmount] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/signup";
            return;
        }
        fetchUserData(token);
    }, []);

    useEffect(() => {
        if (!search) {
            setSearchResults([]);
            return;
        }

        setSearchResults([]);
        setLoading(true);

        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/search?filter=${search}`);
                if (!response.ok) throw new Error("Failed to fetch");

                const data = await response.json();
                setSearchResults(data.user);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [search]);

    const fetchUserData = async (token: string) => {
        try {
            const response = await fetch("http://localhost:3000/account/balance", {
                method: "GET",
                headers: { "token": `${token}` },
            });
            const data = await response.json();
            if (data.status) {
                setBalance(data.balance);
                setUser({ firstname: data.firstname, lastname: data.lastname });
            }
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    const handlePayClick = (user: { firstname: string; lastname: string; email: string, _id: string }) => {
        setSelectedUser(user);
        setAmount("");
    };

    const handleSendMoney = async () => {
        if (!amount || isNaN(parseFloat(amount))) return;

        try {
            await fetch("http://localhost:3000/account/transfer", {
                method: "POST",
                headers: {
                    "token": `${localStorage.getItem("token")}`, // Corrected
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ receiverId: selectedUser?._id, amount: parseFloat(amount) }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.status) {
                        setBalance(data.balance);
                        setSearchResults([]);
                        setSearch("");
                    }
                });
        } catch (error) {
            console.error("Error sending money:", error);
        }
        setSelectedUser(null); // Close modal after sending
    };

    return (
        <div className="h-screen w-screen flex flex-col p-6 relative">
            {/* Navbar */}
            <div className="flex items-center justify-between pb-4 border-b px-6 py-4 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold">Payment App</h1>
                <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>

            {/* Welcome Section */}
            <h1 className="pt-6 text-2xl font-semibold">
                Welcome, {user?.firstname || <Skeleton className="w-24 h-6" />}!
            </h1>

            {/* Balance Section */}
            <p className="text-lg mt-2">
                Account Balance:{" "}
                {balance !== null ? (
                    <span className="text-green-600 font-bold">${balance.toFixed(2)}</span>
                ) : (
                    <Skeleton className="h-6 w-20" />
                )}
            </p>

            {/* Search Users */}
            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Search Users</h2>
                <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-3 w-full"
                />
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : searchResults.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                        {searchResults.map((result) => (
                            <li key={result.email} className="flex justify-between items-center p-3 bg-gray-200 rounded-lg h-10 text-gray-900">
                                <span>{result.firstname} {result.lastname}</span>
                                <Button variant="default" onClick={() => handlePayClick(result)}>Pay</Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    search && <p className="text-gray-500 text-sm">No users found</p>
                )}
            </div>

            {/* Payment Modal */}
            {selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">
                            Send Money to {selectedUser.firstname} {selectedUser.lastname}
                        </h2>
                        <Input
                            type="text"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mb-4 text-black"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
                            <Button variant="default" onClick={handleSendMoney}>Send Money</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
