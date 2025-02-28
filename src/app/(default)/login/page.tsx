'use client';

import { FormEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Container, Typography, Box, CircularProgress } from "@mui/material";
import { safeApiFetcher } from "@/client-api/common-utils";

export default function LoginPage()
{
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ error, setError ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const router = useRouter();

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) =>
    {
        event.preventDefault();
        setError("");
        setLoading(true);

        try
        {
            await safeApiFetcher("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            }).then(() =>
            {
                router.push("/");
            }).catch((response) =>
            {
                const data = response;
                setError(data.status || "Invalid credentials");
            });
        } catch (error: unknown)
        {
            console.log(error);
            setError("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="xs" className="ltr" style={ { direction: 'ltr' } }>
            <Box sx={ { mt: 8, display: "flex", flexDirection: "column", alignItems: "center" } }>
                <Typography variant="h4" fontWeight={ 700 }>Login</Typography>
                <Box component="form" onSubmit={ handleSubmit } sx={ { mt: 2, width: "100%" } }>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="filled"
                        margin="normal"
                        type="username"
                        value={ username }
                        onChange={ (e) => setUsername(e.target.value) }
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        variant="filled"
                        margin="normal"
                        type="password"
                        value={ password }
                        onChange={ (e) => setPassword(e.target.value) }
                        required
                    />
                    { error && <Typography color="error" sx={ { mt: 1 } }>{ error }</Typography> }
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={ { mt: 2 } }
                        disabled={ loading }
                    >
                        { loading ? <CircularProgress size={ 24 } /> : "Login" }
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
