from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import supabase_routes


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default port for development
        "https://fragile-paradox.vercel.app",  # Your Vercel frontend URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(supabase_routes.router)

@app.get("/")
async def root():
    return {"message": "Resume Parser API is running!"}

