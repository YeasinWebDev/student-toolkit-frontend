import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign In Data:", formData)
    // Call API here
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px] border-0">
        <CardHeader>
          <CardTitle className="text-center text-xl">Sign In</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 rounded-md"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 mt-4">
            <Button type="submit" className="w-full rounded-md bg-primary text-white">Sign In</Button>
            <p className="text-sm text-center text-gray-600">
              Don’t have an account? <Link to   ="/signup" className="text-primary">Sign Up</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
