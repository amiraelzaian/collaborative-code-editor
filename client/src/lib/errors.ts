
import { isAxiosError } from "axios"
export const getErrorMessage = (err: unknown): string =>
    isAxiosError(err) ? (err.response?.data?.message ?? "Request failed")
        : "Something went wrong"
