import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasFirebaseConfig } from "@/config/env";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { authFormSchema, type AuthFormValues } from "@/features/auth/schemas/auth.schema";
import type { AuthMode } from "@/features/auth/types/auth.types";

type RedirectState = {
  from?: {
    pathname?: string;
  };
};

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const register = useRegister();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      mode: "login",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const pending = login.isPending || register.isPending;
  const error = login.error ?? register.error;
  const redirectTo = (location.state as RedirectState | null)?.from?.pathname ?? "/dashboard";
  const navigateAfterAuth = () => navigate(redirectTo, { replace: true });

  const onSubmit = form.handleSubmit((values) => {
    if (values.mode === "register") {
      register.mutate(
        {
          displayName: values.displayName,
          email: values.email,
          password: values.password,
        },
        { onSuccess: navigateAfterAuth },
      );
      return;
    }

    login.mutate(
      {
        email: values.email,
        password: values.password,
      },
      { onSuccess: navigateAfterAuth },
    );
  });

  const switchMode = () => {
    const nextMode: AuthMode = mode === "login" ? "register" : "login";
    login.reset();
    register.reset();
    setMode(nextMode);
    form.reset({
      mode: nextMode,
      displayName: "",
      email: form.getValues("email"),
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-leaf-100 text-leaf-700">
          <Leaf className="h-5 w-5" />
        </div>
        <CardTitle className="font-serif text-3xl">{mode === "register" ? "Create account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {mode === "register"
            ? "Register with Firebase Auth to start managing farm inventory."
            : "Sign in with your Firebase Auth account to manage farm inventory."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasFirebaseConfig ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Firebase environment variables are not configured yet. Add them in `.env.local`.
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" {...form.register("mode")} />
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input id="displayName" type="text" autoComplete="name" {...form.register("displayName")} />
              {form.formState.errors.displayName ? <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p> : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} {...form.register("password")} />
            {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword ? <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p> : null}
            </div>
          ) : null}
          {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error.message}</p> : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? (mode === "register" ? "Creating account..." : "Signing in...") : mode === "register" ? "Create account" : "Sign in"}
          </Button>
          <Button className="w-full" type="button" variant="ghost" onClick={switchMode} disabled={pending}>
            {mode === "register" ? "Already have an account? Sign in" : "Need an account? Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
