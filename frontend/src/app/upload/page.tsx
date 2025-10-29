"use client"
import { useUser } from "@/hooks/use-user"

import { createClient } from "@/utils/supabase/client"

export default function SignInPage() {
  const { user, loading, error, role } = useUser()
  console.log(user, loading, error, role)

  async function handleClick() {
    try{
    const supabase = createClient()
    const session = await supabase.auth.getSession()
    const res = await fetch('http://localhost:8000/supabase/users', {
        headers:{
          "Authorization": `Bearer ${session.data.session?.access_token}`
        }
      })
    const data = await res.json()
    console.log(data)
    }catch(err){
      console.error('Error fetching data:', err)
    }
  }

  return <div>
    <div>
      Upload Page
    </div>
    <button onClick={handleClick}>
      Test Supabase
    </button>
  </div>
}
