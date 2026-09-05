"""
Custom exceptions — generic HTTPException(500) har jagah dalne se better
hai specific exception classes banake ek jagah se handle karna.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class PrepMateException(Exception):
    """Base class — sab custom exceptions isi se extend karenge."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code


class DocumentProcessingError(PrepMateException):
    def __init__(self, message: str = "Failed to process document"):
        super().__init__(message, status_code=500)


class NoStudyMaterialError(PrepMateException):
    def __init__(self, topic: str):
        super().__init__(f"No study material found for topic '{topic}'", status_code=404)


class QuizGenerationError(PrepMateException):
    def __init__(self, message: str = "Could not generate valid quiz questions"):
        super().__init__(message, status_code=422)


def register_exception_handlers(app: FastAPI):
    @app.exception_handler(PrepMateException)
    async def prepmate_exception_handler(request: Request, exc: PrepMateException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        # Yeh sirf truly unexpected errors ke liye hai — koi bhi
        # HTTPException ya PrepMateException isse pehle hi handle ho chuki hogi
        return JSONResponse(
            status_code=500,
            content={"detail": "Something went wrong. Please try again."},
        )