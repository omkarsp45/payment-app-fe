"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Form schema validation
const formSchema = z.object({
    email: z.string().nonempty({ message: "Email is required." }).email({ message: "Invalid email address." }),
    password: z
        .string()
        .nonempty({ message: "Password is required." })
        .min(8, { message: "Password must be at least 8 characters." })
        .max(20, { message: "Password must be at most 20 characters." })
});

export function Signin() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const signinResponse = await fetch("http://localhost:3000/user/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            if (!signinResponse.ok) {
                throw new Error("Failed to sign in");
            }
            const { token } = await signinResponse.json();
            localStorage.setItem("token", token);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen w-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white w-96 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-center mb-6 text-zinc-800">Sign In</h2>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-800">Email</FormLabel>
                                <FormControl>
                                    <Input className="text-zinc-600" type="email" placeholder="johndoe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-800">Password</FormLabel>
                                <FormControl>
                                    <Input className="text-zinc-600" type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button className="m-2" type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Sign Up"}
                    </Button>

                    <p className="text-sm text-center text-zinc-500">
                        Don't have an account? <a href="/signup" className="text-blue-500">Sign Up</a>
                    </p>
                </form>
            </Form>
        </div>
    );
}
