import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign Up Data:", formData)
    // Call API here
  }

  return (
    <div className="flex justify-center items-center h-screen ">
      <Card className="w-[350px] border-0">
        <CardHeader>
          <CardTitle className="text-center text-xl">Sign Up</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded-md mt-2"
              />
            </div>
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
                className="rounded-md mt-2"
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
                className="rounded-md mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 mt-4">
            <Button type="submit" className="w-full rounded-md text-white">Sign Up</Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account? <Link to="/signin" className="text-primary">Sign In</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
