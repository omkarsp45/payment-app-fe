import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
    const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<{ firstname: string; lastname: string; email: string }[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/signup";
            return;
        }
        fetchUserData(token);
    }, []);

    useEffect(() => {
        if (!search) return; 

        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/search?filter=${(search)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch");
                }
                const data = await response.json();
                console.log(data);
                setSearchResults(data.user);
            } catch (error) {
                console.error("Error fetching search results:", error);
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

    return (
        <div className="h-screen w-screen flex flex-col p-6 bg-gray-900 text-white">
            {/* Navbar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-700 bg-gray-800 px-6 py-4 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold">Payment App</h1>
                <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>

            {/* Welcome Section */}
            <h1 className="pt-6 text-2xl font-semibold">
                Welcome, {user?.firstname || <Skeleton className="w-24 h-6 bg-gray-700" />}!
            </h1>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Balance Card */}
                <Card className="bg-gray-800 border border-gray-700 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-300">Account Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {balance !== null ? (
                            <p className="text-3xl font-bold text-green-400">${balance.toFixed(2)}</p>
                        ) : (
                            <Skeleton className="h-8 w-24 bg-gray-700" />
                        )}
                    </CardContent>
                </Card>

                {/* Search Users Card */}
                <Card className="bg-gray-800 border border-gray-700 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-300">Search Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mb-3 bg-gray-700 border-gray-600 text-white"
                        />
                        {searchResults.length > 0 ? (
                            <ul className="mt-2 space-y-2">
                                {searchResults.map((result) => (
                                    <li
                                        key={result.email}
                                        className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                    >
                                        {result.firstname} {result.lastname}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            search && <p className="text-gray-400 text-sm">No users found</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}