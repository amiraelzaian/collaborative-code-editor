import type { NextFunction, Request, Response } from "express"
import { success, ZodType } from "zod"



// source of the fields
type Target = 'body' | 'params' | 'query'


export const validate = (schema: ZodType, target: Target = 'body') => (
    req: Request, res: Response, next: NextFunction
): void => {

    const result = schema.safeParse(req[target])

    if (!result.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map(i => ({
                field: i.path.join("."),
                message: i.message,
            }))
        })
        return;
    }

    if (target === 'body') {
        req.body = result.data;
    }
    if (target === 'query') {
        res.locals.query = result.data
    }
    next();

}
























