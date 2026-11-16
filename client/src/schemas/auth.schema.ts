import { z } from "zod";
export const loginSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})
export const registerSchema = z.object({
    name: z.string().nonempty("Name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    passwordConfirm: z.string().min(1, "Please confirm your password"),
}).refine(
    (data) => data.password === data.passwordConfirm,
    {
        message: "Passwords do not match",
        path: ["passwordConfirm"]
    }
)

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
