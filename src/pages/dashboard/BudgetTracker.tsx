import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { Loader } from "@/components/Loader";

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState<{ type: "income" | "expense"; amount: number; desc: string }[]>([]);
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState<number>();
  const [desc, setDesc] = useState("");
  const [page, setPage] = useState(1);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getAllTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/budget?page=${page}`, { withCredentials: true });
      setTotalBalance(response.data.data.totalBalance);
      setTotalExpense(response.data.data.totalExpense);
      setTotalIncome(response.data.data.totalIncome);
      setTotalPages(response.data.data.totalPages);
      setTransactions(response.data.data.budgets);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllTransactions();
  }, [page]);

  const addTransaction = async () => {
    if( desc === "" || !type || amount === 0) {
      return toast.error("All fields are required");
    }
    if (typeof amount !== "number" || amount <= 0) {
      return toast.error("Amount must be a number greater than 0");
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/budget/create`, { type, amount, desc }, { withCredentials: true });
      setType("income");
      setAmount(0);
      setDesc("");
      getAllTransactions();
      toast.success("Budget added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
    }
  };


  return (
    <div className="lg:max-w-7xl mx-auto lg:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">💰 Budget Tracker</h1>
      <p className="text-center text-muted-foreground">Track your income, expenses, and savings easily</p>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="whitespace-nowrap">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-center">৳ {totalBalance.toFixed(2)}</CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent className="text-green-600 text-2xl font-semibold text-center">৳ {totalIncome.toFixed(2)}</CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 text-2xl font-semibold text-center">৳ {totalExpense.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card className="p-4 shadow-md">
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row flex-wrap gap-3">
            <Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-48 rounded" />
            <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-48 rounded" />
            <Select value={type} onValueChange={(val: "income" | "expense") => setType(val)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTransaction} className="rounded cursor-pointer">
              <PlusCircle className="h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground">No transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="border">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">#</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Type</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => (
                        <tr key={i} className={`border-t ${t.type === "income" ? "bg-gr" : "bg-"}`}>
                          <td className="px-4 py-2 text-sm">{i + 1}</td>
                          <td className="px-4 py-2 text-sm font-medium">{t.desc}</td>
                          <td className="px-4 py-2 text-sm font-semibold">
                            <span className={`${t.type === "income" ? "text-green-600" : "text-red-600"}`}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span>
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium">
                            <span className={`${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                              {t.type === "income" ? "+" : "-"} ৳ {t.amount.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>

            <CardFooter className="mx-auto">
              {totalPages > 0 && (
                <div className="flex gap-4 mt-4 items-center">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-primary rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-primary rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
