"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Info,
  Clock,
  CheckCircle,
  CreditCard,
  Plus,
  Zap,
  Shield,
  Globe,
  LogIn,
  LogOut,
  User,
  QrCode,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

interface Transaction {
  id: string
  type: "send" | "receive" | "deposit"
  amount: number
  currency: string
  network?: string
  recipient?: string
  sender?: string
  timestamp: Date
  status: "completed" | "pending" | "failed"
  txHash?: string
  networkFee?: number
  blockHeight?: number
  confirmations?: number
  estimatedCompletion?: Date
  // Deposit specific fields
  paymentMethod?: string
  cardLast4?: string
  cardType?: string
  processingFee?: number
  referenceId?: string
}

interface WalletBalance {
  currency: string
  balance: number
  usdValue: number
  symbol: string
}

interface NetworkOption {
  id: string
  name: string
  currency: string
  fee: number
  minFee?: number
  confirmationTime: number
  icon: string
}

interface UserAccount {
  username: string
  password: string
  walletAddress: string
  createdAt: Date
  walletBalances: WalletBalance[]
  transactions: Transaction[]
}

interface AlertBanner {
  id: string
  type: "success" | "warning" | "error" | "info"
  message: string
  timestamp: number
}

const networkOptions: NetworkOption[] = [
  { id: "ethereum", name: "Ethereum (ERC-20)", currency: "USDT", fee: 15.0, confirmationTime: 60, icon: "⟠" },
  { id: "bsc", name: "BNB Smart Chain (BEP-20)", currency: "USDT", fee: 15.0, confirmationTime: 60, icon: "⚡" },
  { id: "polygon", name: "Polygon (MATIC)", currency: "USDT", fee: 15.0, confirmationTime: 60, icon: "⬟" },
  { id: "tron", name: "TRON (TRC-20)", currency: "USDT", fee: 15.0, confirmationTime: 60, icon: "◈" },
  { id: "ton", name: "TON Network", currency: "USDT", fee: 12.0, minFee: 12.0, confirmationTime: 60, icon: "💎" },
  { id: "bitcoin", name: "Bitcoin Network", currency: "Bitcoin", fee: 0.0001, confirmationTime: 60, icon: "₿" },
  { id: "lightning", name: "Lightning Network", currency: "Bitcoin", fee: 0.000001, confirmationTime: 60, icon: "⚡" },
]

const TON_DEPOSIT_ADDRESS = "EQCA1BI4QRZ8qYmskSRDzJmkucGodYRTZCf_b9hckjla6dZland"
const TON_DEPOSIT_MEMO = "2086885702"
const BTC_CURRENT_PRICE = 108903.9
const TON_PRICE = 2.74 // TON price in USD (updated from 2.5)

// Helper function to safely format dates
const formatDate = (timestamp: Date | string | number) => {
  const date = new Date(timestamp)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
  }
}

// Pre-configured BeckyRiley93 account
const BECKY_ACCOUNT: UserAccount = {
  username: "BeckyRiley93",
  password: "Lavender12@",
  walletAddress: "0xBe4c7y91L3y93A8d9F2e1B5c6D7e8F9a0B1c2D3e4F5",
  createdAt: new Date("2024-01-15T10:30:00Z"),
  walletBalances: [
    { currency: "USDT", balance: 10000.0, usdValue: 10000.0, symbol: "USDT" },
    { currency: "Bitcoin", balance: 1.0, usdValue: 108903.9, symbol: "BTC" },
    { currency: "TON", balance: 1.0, usdValue: 2.74, symbol: "TON" }, // Updated balance and value
  ],
  transactions: [
    {
      id: "becky_deposit_001",
      type: "deposit",
      amount: 5000.0,
      currency: "USDT",
      timestamp: new Date(new Date().getTime() - 2592000000), // 30 days ago
      status: "completed",
      paymentMethod: "Bank Transfer",
      referenceId: "BANK-2024-001-BCK-5000",
    },
    {
      id: "becky_deposit_002",
      type: "deposit",
      amount: 5000.0,
      currency: "USDT",
      timestamp: new Date(new Date().getTime() - 1296000000), // 15 days ago
      status: "completed",
      paymentMethod: "Visa Card",
      cardLast4: "7829",
      cardType: "Visa",
      processingFee: 25.0,
      referenceId: "DEP-2024-002-VIS-7829",
    },
    {
      id: "becky_btc_001",
      type: "receive",
      amount: 0.5,
      currency: "Bitcoin",
      network: "Bitcoin Network",
      sender: "bc1qm8n7x9p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g",
      timestamp: new Date(new Date().getTime() - 1728000000), // 20 days ago
      status: "completed",
      txHash: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
      networkFee: 0.0001,
      blockHeight: 825678,
      confirmations: 15,
    },
    {
      id: "becky_btc_002",
      type: "receive",
      amount: 0.5,
      currency: "Bitcoin",
      network: "Bitcoin Network",
      sender: "bc1qz9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f",
      timestamp: new Date(new Date().getTime() - 864000000), // 10 days ago
      status: "completed",
      txHash: "0xa9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
      networkFee: 0.0001,
      blockHeight: 826234,
      confirmations: 12,
    },
    {
      id: "becky_send_001",
      type: "send",
      amount: 500.0,
      currency: "USDT",
      network: "Ethereum (ERC-20)",
      recipient: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      timestamp: new Date(new Date().getTime() - 432000000), // 5 days ago
      status: "completed",
      txHash: "0xc1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
      networkFee: 15.0,
      blockHeight: 18567890,
      confirmations: 24,
    },
  ],
}

export default function CryptoVaultExchange() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" })
  const [isRegistering, setIsRegistering] = useState(false)
  const [showDepositDialog, setShowDepositDialog] = useState(false)

  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([])
  const [showBalance, setShowBalance] = useState(true)
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("USDT")
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [processingTransactions, setProcessingTransactions] = useState<Set<string>>(new Set())
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [gasFeePending, setGasFeePending] = useState<string | null>(null)
  const [showGasFeeDialog, setShowGasFeeDialog] = useState(false)
  const [pendingTransfer, setPendingTransfer] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [alertBanners, setAlertBanners] = useState<AlertBanner[]>([])

  // Add alert banner
  const addAlert = (type: AlertBanner["type"], message: string) => {
    const newAlert: AlertBanner = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
    }
    setAlertBanners((prev) => [newAlert, ...prev.slice(0, 2)]) // Keep max 3 alerts

    // Auto remove after 5 seconds
    setTimeout(() => {
      setAlertBanners((prev) => prev.filter((alert) => alert.id !== newAlert.id))
    }, 5000)
  }

  // Remove alert banner
  const removeAlert = (id: string) => {
    setAlertBanners((prev) => prev.filter((alert) => alert.id !== id))
  }

  // Get TON balance
  const getTonBalance = () => {
    const tonWallet = walletBalances.find((w) => w.currency === "TON")
    return tonWallet ? tonWallet.balance : 0
  }

  // Check if user has enough TON for gas fees
  const hasEnoughTonForGas = () => {
    const tonBalance = getTonBalance()
    const networkInfo = getSelectedNetworkInfo()
    const requiredTon = networkInfo ? networkInfo.fee / TON_PRICE : 0
    return tonBalance >= requiredTon
  }

  // Refresh TON balance
  const refreshTonBalance = async () => {
    setIsRefreshing(true)
    addAlert("info", "Refreshing TON balance...")

    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would fetch from blockchain
      // For demo, we'll simulate a small increase
      const updatedBalances = walletBalances.map((wallet) => {
        if (wallet.currency === "TON") {
          const newBalance = wallet.balance + Math.random() * 5 // Random increase for demo
          return {
            ...wallet,
            balance: newBalance,
            usdValue: newBalance * TON_PRICE,
          }
        }
        return wallet
      })

      setWalletBalances(updatedBalances)
      if (currentUser) {
        updateUserData(updatedBalances, transactions)
      }

      setIsRefreshing(false)
      addAlert("success", "TON balance refreshed successfully!")
    }, 2000)
  }

  // Initialize pre-configured accounts
  useEffect(() => {
    const initializeAccounts = () => {
      const savedUsers = JSON.parse(localStorage.getItem("cryptovault_users") || "{}")

      // Always ensure BeckyRiley93 account exists with latest data
      savedUsers["BeckyRiley93"] = BECKY_ACCOUNT

      // Add demo account if it doesn't exist
      if (!savedUsers["demo"]) {
        savedUsers["demo"] = {
          username: "demo",
          password: "demo123",
          walletAddress: "0xDemo123456789abcdef0123456789abcdef01234567",
          createdAt: new Date(),
          walletBalances: [
            { currency: "USDT", balance: 1000.0, usdValue: 1000.0, symbol: "USDT" },
            { currency: "Bitcoin", balance: 0.01, usdValue: 1089.04, symbol: "BTC" },
            { currency: "TON", balance: 1.0, usdValue: 2.74, symbol: "TON" }, // Updated balance and value
          ],
          transactions: [],
        }
      }

      localStorage.setItem("cryptovault_users", JSON.stringify(savedUsers))
    }

    initializeAccounts()

    // Check for existing session
    const savedUser = localStorage.getItem("cryptovault_user")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      // Refresh user data from storage to get latest balances
      const allUsers = JSON.parse(localStorage.getItem("cryptovault_users") || "{}")
      const refreshedUser = allUsers[user.username] || user
      setCurrentUser(refreshedUser)
      setWalletBalances(refreshedUser.walletBalances || [])
      setTransactions(refreshedUser.transactions || [])
      setIsLoggedIn(true)
    }
  }, [])

  // Process pending transactions - complete immediately after gas fee deposit
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((tx) => {
          if (tx.status === "pending") {
            // Complete transaction immediately after gas fee is deducted
            setProcessingTransactions((prev) => {
              const newSet = new Set(prev)
              newSet.delete(tx.id)
              return newSet
            })
            return {
              ...tx,
              status: "completed" as const,
              confirmations: Math.floor(Math.random() * 10) + 6,
              blockHeight:
                tx.currency === "Bitcoin"
                  ? 815500 + Math.floor(Math.random() * 100)
                  : 18543000 + Math.floor(Math.random() * 1000),
            }
          }
          return tx
        }),
      )
    }, 2000) // Check every 2 seconds for immediate completion

    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      addAlert("error", "Please enter username and password")
      return
    }

    // Check if user exists in localStorage
    const savedUsers = JSON.parse(localStorage.getItem("cryptovault_users") || "{}")
    const user = savedUsers[loginForm.username]

    if (user && user.password === loginForm.password) {
      setCurrentUser(user)
      setWalletBalances(user.walletBalances || [])
      setTransactions(user.transactions || [])
      setIsLoggedIn(true)
      localStorage.setItem("cryptovault_user", JSON.stringify(user))
      setLoginForm({ username: "", password: "" })
      addAlert("success", `Welcome back, ${user.username}!`)
    } else {
      addAlert("error", "Invalid username or password")
    }
  }

  const handleRegister = () => {
    if (!registerForm.username || !registerForm.password) {
      addAlert("error", "Please fill in all fields")
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      addAlert("error", "Passwords do not match")
      return
    }

    if (registerForm.password.length < 6) {
      addAlert("error", "Password must be at least 6 characters")
      return
    }

    // Check if user already exists
    const savedUsers = JSON.parse(localStorage.getItem("cryptovault_users") || "{}")
    if (savedUsers[registerForm.username]) {
      addAlert("error", "Username already exists")
      return
    }

    // Generate wallet address
    const walletAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

    const newUser: UserAccount = {
      username: registerForm.username,
      password: registerForm.password,
      walletAddress: walletAddress,
      createdAt: new Date(),
      walletBalances: [
        { currency: "USDT", balance: 100.0, usdValue: 100.0, symbol: "USDT" },
        { currency: "Bitcoin", balance: 0.001, usdValue: 108.9, symbol: "BTC" },
        { currency: "TON", balance: 1.0, usdValue: 2.74, symbol: "TON" }, // Updated balance and value
      ],
      transactions: [],
    }

    // Save user
    savedUsers[registerForm.username] = newUser
    localStorage.setItem("cryptovault_users", JSON.stringify(savedUsers))

    // Auto login
    setCurrentUser(newUser)
    setWalletBalances(newUser.walletBalances)
    setTransactions(newUser.transactions)
    setIsLoggedIn(true)
    localStorage.setItem("cryptovault_user", JSON.stringify(newUser))
    setRegisterForm({ username: "", password: "", confirmPassword: "" })
    setIsRegistering(false)
    addAlert("success", `Account created successfully! Welcome, ${newUser.username}!`)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setWalletBalances([])
    setTransactions([])
    localStorage.removeItem("cryptovault_user")
    setLoginForm({ username: "", password: "" })
    addAlert("info", "Logged out successfully")
  }

  const updateUserData = (updatedBalances: WalletBalance[], updatedTransactions: Transaction[]) => {
    if (!currentUser) return

    const updatedUser = {
      ...currentUser,
      walletBalances: updatedBalances,
      transactions: updatedTransactions,
    }

    // Update localStorage
    const savedUsers = JSON.parse(localStorage.getItem("cryptovault_users") || "{}")
    savedUsers[currentUser.username] = updatedUser
    localStorage.setItem("cryptovault_users", JSON.stringify(savedUsers))
    localStorage.setItem("cryptovault_user", JSON.stringify(updatedUser))

    setCurrentUser(updatedUser)
  }

  const getTotalBalance = () => {
    return walletBalances.reduce((total, wallet) => total + wallet.usdValue, 0)
  }

  const getCurrentBalance = (currency: string) => {
    const wallet = walletBalances.find((w) => w.currency === currency)
    return wallet ? wallet.balance : 0
  }

  const getAvailableNetworks = () => {
    return networkOptions.filter((network) => network.currency === selectedCurrency)
  }

  const getSelectedNetworkInfo = () => {
    return networkOptions.find((network) => network.id === selectedNetwork)
  }

  const generateTxHash = () => {
    return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  const getTimeRemaining = (estimatedCompletion: Date) => {
    const now = new Date()
    const diff = estimatedCompletion.getTime() - now.getTime()
    if (diff <= 0) return "Processing..."

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s remaining`
    }
    return `${remainingSeconds}s remaining`
  }

  const getProgressPercentage = (estimatedCompletion: Date, startTime: Date) => {
    const now = new Date()
    const totalTime = estimatedCompletion.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    return Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
  }

  const validateGasFee = (networkInfo: NetworkOption, amount: number) => {
    if (networkInfo.minFee && networkInfo.fee < networkInfo.minFee) {
      return `Minimum gas fee for ${networkInfo.name} is $${networkInfo.minFee}`
    }
    return null
  }

  const handleTransfer = () => {
    const amount = Number.parseFloat(transferAmount)
    const currentBalance = getCurrentBalance(selectedCurrency)
    const networkInfo = getSelectedNetworkInfo()

    if (!amount || amount <= 0) {
      addAlert("error", "Please enter a valid amount")
      return
    }

    if (amount > currentBalance) {
      addAlert("error", "Insufficient balance")
      return
    }

    if (!recipientAddress) {
      addAlert("error", "Please enter recipient address")
      return
    }

    if (!networkInfo) {
      addAlert("error", "Please select a network")
      return
    }

    // Check TON balance for gas fees
    if (!hasEnoughTonForGas()) {
      const requiredTon = networkInfo.fee / TON_PRICE
      addAlert(
        "warning",
        `Insufficient TON for gas fees. You need ${requiredTon.toFixed(2)} TON (≈$${networkInfo.fee}) to complete this transaction. Please deposit TON first.`,
      )
      return
    }

    // Store pending transfer details
    setPendingTransfer({
      amount,
      currency: selectedCurrency,
      network: networkInfo,
      recipient: recipientAddress,
    })

    // Show gas fee payment dialog
    setShowGasFeeDialog(true)
  }

  const handleGasFeePayment = () => {
    if (!pendingTransfer) return

    const { amount, currency, network, recipient } = pendingTransfer
    const usdValue = currency === "Bitcoin" ? amount * BTC_CURRENT_PRICE : amount
    const estimatedCompletion = new Date(Date.now() + network.confirmationTime * 1000)
    const requiredTon = network.fee / TON_PRICE

    // Check TON balance again
    if (!hasEnoughTonForGas()) {
      addAlert("error", "Insufficient TON balance for gas fees")
      return
    }

    // Create new transaction with pending status
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "send",
      amount: amount,
      currency: currency,
      network: network.name,
      recipient: recipient,
      timestamp: new Date(),
      status: "pending",
      txHash: generateTxHash(),
      networkFee: network.fee,
      confirmations: 0,
      estimatedCompletion: estimatedCompletion,
    }

    // Update wallet balances immediately (funds are locked)
    const updatedBalances = walletBalances.map((wallet) => {
      if (wallet.currency === currency) {
        return {
          ...wallet,
          balance: wallet.balance - amount,
          usdValue: wallet.usdValue - usdValue,
        }
      }
      // Deduct TON for gas fees
      if (wallet.currency === "TON") {
        return {
          ...wallet,
          balance: wallet.balance - requiredTon,
          usdValue: wallet.usdValue - network.fee,
        }
      }
      return wallet
    })

    const updatedTransactions = [newTransaction, ...transactions]

    setWalletBalances(updatedBalances)
    setTransactions(updatedTransactions)
    updateUserData(updatedBalances, updatedTransactions)
    setProcessingTransactions((prev) => new Set(prev).add(newTransaction.id))

    // Reset form and close dialogs
    setTransferAmount("")
    setRecipientAddress("")
    setShowGasFeeDialog(false)
    setPendingTransfer(null)

    addAlert("success", "Gas fee payment confirmed! Transaction is now processing and will complete shortly.")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addAlert("success", "Copied to clipboard!")
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "deposit") {
      return <Plus className="h-4 w-4" />
    }
    if (transaction.status === "pending") {
      return <Clock className="h-4 w-4" />
    }
    return transaction.type === "send" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />
  }

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.type === "deposit") {
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    }
    if (transaction.status === "pending") {
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
    }
    return transaction.type === "send"
      ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
      : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
  }

  const getTransactionAmountColor = (transaction: Transaction) => {
    if (transaction.type === "deposit") {
      return "text-blue-600 dark:text-blue-400"
    }
    if (transaction.status === "pending") {
      return "text-yellow-600 dark:text-yellow-400"
    }
    return transaction.type === "send" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
  }

  // Update selected network when currency changes
  useEffect(() => {
    const availableNetworks = getAvailableNetworks()
    if (availableNetworks.length > 0 && !availableNetworks.find((n) => n.id === selectedNetwork)) {
      setSelectedNetwork(availableNetworks[0].id)
    }
  }, [selectedCurrency])

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        {/* Alert Banners */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
          {alertBanners.map((alert) => (
            <Alert
              key={alert.id}
              className={`${
                alert.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-300"
                  : alert.type === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : alert.type === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                      : "bg-blue-500/10 border-blue-500/20 text-blue-300"
              } backdrop-blur-xl`}
            >
              {alert.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {alert.type === "error" && <AlertCircle className="h-4 w-4" />}
              {alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
              {alert.type === "info" && <Info className="h-4 w-4" />}
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAlert(alert.id)}
                  className="h-4 w-4 p-0 ml-2 hover:bg-white/10"
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border-white/10 text-white">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CryptoVault
              </div>
            </div>
            <CardTitle className="text-2xl">{isRegistering ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription className="text-gray-400">
              {isRegistering ? "Create your secure Web3 wallet" : "Sign in to your Web3 wallet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRegistering ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Enter username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password" className="text-gray-300">
                    Confirm Password
                  </Label>
                  <Input
                    id="reg-confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleRegister}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsRegistering(false)}
                  className="w-full text-gray-300 hover:text-white"
                >
                  Already have an account? Sign In
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsRegistering(true)}
                  className="w-full text-gray-300 hover:text-white"
                >
                  Don't have an account? Sign Up
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Alert Banners */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
        {alertBanners.map((alert) => (
          <Alert
            key={alert.id}
            className={`${
              alert.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-300"
                : alert.type === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                  : alert.type === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-300"
            } backdrop-blur-xl`}
          >
            {alert.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {alert.type === "error" && <AlertCircle className="h-4 w-4" />}
            {alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
            {alert.type === "info" && <Info className="h-4 w-4" />}
            <AlertDescription className="flex items-center justify-between">
              <span>{alert.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAlert(alert.id)}
                className="h-4 w-4 p-0 ml-2 hover:bg-white/10"
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CryptoVault
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                <Globe className="h-3 w-3 mr-1" />
                Web3
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/20">
                <Shield className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <div className="text-sm text-gray-300">{formatAddress(currentUser?.walletAddress || "")}</div>
              <div className="text-sm text-gray-400">@{currentUser?.username}</div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-xl border-white/10 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-purple-400" />
                    DeFi Wallet
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshTonBalance}
                      disabled={isRefreshing}
                      className="text-gray-300 hover:text-white"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-gray-300 hover:text-white"
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Portfolio Value</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      {showBalance ? `$${getTotalBalance().toFixed(2)}` : "****"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {walletBalances.map((wallet) => (
                      <div
                        key={wallet.currency}
                        className={`bg-white/5 backdrop-blur-sm p-3 rounded-lg border ${
                          wallet.currency === "TON" ? "border-yellow-500/20 bg-yellow-500/5" : "border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              {wallet.symbol}
                              {wallet.currency === "TON" && <span className="text-yellow-400">💎</span>}
                            </p>
                            <p className="font-semibold text-white">
                              {showBalance ? wallet.balance.toFixed(wallet.currency === "Bitcoin" ? 5 : 2) : "****"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">≈ USD</p>
                            <p className="font-semibold text-sm text-gray-200">
                              {showBalance ? `$${wallet.usdValue.toFixed(2)}` : "****"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TON Balance Warning */}
                  {getTonBalance() < 10 && (
                    <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-300">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Low TON balance! You need TON to pay gas fees for transactions. Deposit TON to continue trading.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={() => setShowDepositDialog(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Deposit TON
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bitcoin Price */}
            <Card className="mt-6 bg-black/20 backdrop-blur-xl border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  BTC/USD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-green-400">
                  <span className="text-2xl font-bold">${BTC_CURRENT_PRICE.toLocaleString()}</span>
                  <p className="text-sm text-gray-400">+$633.90 (+0.59%) today</p>
                </div>
              </CardContent>
            </Card>

            {/* Web3 Features */}
            <Card className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-purple-500/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Web3 Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Non-custodial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span>Multi-chain support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>DeFi integrated</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transfer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-xl border-white/10">
                <TabsTrigger
                  value="transfer"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300"
                >
                  Transfer
                </TabsTrigger>
                <TabsTrigger
                  value="deposit"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300"
                >
                  Deposit
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300"
                >
                  History
                </TabsTrigger>
              </TabsList>

              {/* Transfer Tab */}
              <TabsContent value="transfer">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5 text-purple-400" />
                      Send Cryptocurrency
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Transfer cryptocurrency across multiple blockchain networks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* TON Gas Fee Warning */}
                    {!hasEnoughTonForGas() && (
                      <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">Insufficient TON for gas fees!</p>
                            <p className="text-sm">
                              You need{" "}
                              {getSelectedNetworkInfo() ? (getSelectedNetworkInfo()!.fee / TON_PRICE).toFixed(2) : "0"}{" "}
                              TON (≈${getSelectedNetworkInfo()?.fee}) to pay gas fees for this network.
                            </p>
                            <p className="text-sm">Current TON balance: {getTonBalance().toFixed(2)} TON</p>
                            <Button
                              size="sm"
                              onClick={() => setShowDepositDialog(true)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/20"
                            >
                              Deposit TON Now
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-gray-300">
                        Select Currency
                      </Label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10">
                          <SelectItem value="USDT" className="text-white hover:bg-white/10">
                            USDT - Tether
                          </SelectItem>
                          <SelectItem value="Bitcoin" className="text-white hover:bg-white/10">
                            BTC - Bitcoin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="network" className="text-gray-300">
                        Select Network
                      </Label>
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10">
                          {getAvailableNetworks().map((network) => (
                            <SelectItem key={network.id} value={network.id} className="text-white hover:bg-white/10">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{network.icon}</span>
                                <div className="flex flex-col">
                                  <span>{network.name}</span>
                                  <span className="text-xs text-gray-400">
                                    Gas: {(network.fee / TON_PRICE).toFixed(2)} TON (≈${network.fee})
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400">Gas fees paid in TON • Instant completion after payment</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient" className="text-gray-300">
                        Recipient Address
                      </Label>
                      <Input
                        id="recipient"
                        placeholder={
                          selectedCurrency === "Bitcoin"
                            ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                            : "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4"
                        }
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-gray-300">
                        Amount ({selectedCurrency === "Bitcoin" ? "BTC" : "USDT"})
                      </Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          step={selectedCurrency === "Bitcoin" ? "0.00001" : "0.01"}
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                          {selectedCurrency === "Bitcoin" ? "BTC" : "USDT"}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Available: {getCurrentBalance(selectedCurrency).toFixed(selectedCurrency === "Bitcoin" ? 5 : 2)}{" "}
                        {selectedCurrency === "Bitcoin" ? "BTC" : "USDT"}
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Network</span>
                        <span className="text-white flex items-center gap-1">
                          <span>{getSelectedNetworkInfo()?.icon}</span>
                          {getSelectedNetworkInfo()?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Gas Fee (TON)</span>
                        <span className="text-white">
                          {getSelectedNetworkInfo() ? (getSelectedNetworkInfo()!.fee / TON_PRICE).toFixed(2) : "0"} TON
                          (≈${getSelectedNetworkInfo()?.fee})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">USD Value</span>
                        <span className="text-white">
                          {transferAmount
                            ? `$${(Number.parseFloat(transferAmount) * (selectedCurrency === "Bitcoin" ? BTC_CURRENT_PRICE : 1)).toFixed(2)}`
                            : "$0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">TON Balance</span>
                        <span className={`${hasEnoughTonForGas() ? "text-green-400" : "text-red-400"} font-medium`}>
                          {getTonBalance().toFixed(2)} TON
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Completion Time</span>
                        <span className="text-white">Instant</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleTransfer}
                      disabled={!hasEnoughTonForGas()}
                      className={`w-full ${
                        hasEnoughTonForGas()
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          : "bg-gray-600 cursor-not-allowed"
                      } text-white`}
                      size="lg"
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      {hasEnoughTonForGas()
                        ? `Send ${selectedCurrency === "Bitcoin" ? "Bitcoin" : "USDT"}`
                        : "Insufficient TON for Gas Fees"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Deposit Tab */}
              <TabsContent value="deposit">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-blue-400" />
                      Deposit Cryptocurrency
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Deposit funds to your CryptoVault wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">💎</div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">TON Network Deposit</h3>
                          <p className="text-sm text-gray-400">Send TON or USDT on TON network to this address</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-400">Deposit Address</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-white/5 p-3 rounded flex-1 break-all text-white font-mono">
                              {TON_DEPOSIT_ADDRESS}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(TON_DEPOSIT_ADDRESS)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-400">Memo (Required)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-white/5 p-3 rounded flex-1 text-white font-mono">
                              {TON_DEPOSIT_MEMO}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(TON_DEPOSIT_MEMO)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-yellow-300 mt-1">
                            ⚠️ Important: Always include the memo when sending to ensure proper crediting
                          </p>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-yellow-300 font-medium">Important Notes</span>
                          </div>
                          <ul className="text-xs text-yellow-200 space-y-1">
                            <li>• Only send TON or USDT on TON network to this address</li>
                            <li>• Always include the memo: {TON_DEPOSIT_MEMO}</li>
                            <li>• Minimum deposit: $10 USDT equivalent</li>
                            <li>• Deposits typically confirm within 1-2 minutes</li>
                            <li>• TON is required for all transaction gas fees</li>
                            <li>• Click refresh button after deposit to update balance</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            onClick={() => {
                              const depositInfo = `Address: ${TON_DEPOSIT_ADDRESS}\nMemo: ${TON_DEPOSIT_MEMO}`
                              copyToClipboard(depositInfo)
                            }}
                            className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy All
                          </Button>
                          <Button
                            onClick={() => setShowDepositDialog(true)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Show QR
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                      <h4 className="text-sm font-medium text-white mb-2">Other Deposit Methods</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>• Credit/Debit Card (Visa, Mastercard)</p>
                        <p>• Bank Transfer (ACH, Wire)</p>
                        <p>• Other cryptocurrency networks</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-3 bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transaction History Tab */}
              <TabsContent value="history">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10 text-white">
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription className="text-gray-400">Your recent transactions and transfers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 backdrop-blur-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
                              {getTransactionIcon(transaction)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold capitalize text-white">
                                  {transaction.type === "deposit"
                                    ? "Deposit"
                                    : `${transaction.type} ${transaction.currency}`}
                                </p>
                                {transaction.status === "pending" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/20"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                                {transaction.type === "deposit" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/20"
                                  >
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {transaction.paymentMethod?.includes("Card") ? "Card" : "Bank"}
                                  </Badge>
                                )}
                              </div>

                              {transaction.type === "deposit" ? (
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Via {transaction.paymentMethod}
                                    {transaction.cardLast4 && ` •••• ${transaction.cardLast4}`}
                                  </p>
                                  <p className="text-sm text-gray-400">Reference: {transaction.referenceId}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-400">Network: {transaction.network}</p>
                                  <p className="text-sm text-gray-400">
                                    {transaction.type === "send" ? "To: " : "From: "}
                                    {formatAddress(transaction.recipient || transaction.sender || "")}
                                  </p>
                                </div>
                              )}

                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.timestamp).date} {formatDate(transaction.timestamp).time}
                              </p>
                              {transaction.status === "pending" && transaction.estimatedCompletion && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Processing gas fee deposit</span>
                                    <span>Completing shortly...</span>
                                  </div>
                                  <Progress value={90} className="h-1 bg-white/10" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <p className={`font-semibold ${getTransactionAmountColor(transaction)}`}>
                                {transaction.type === "send" ? "-" : "+"}
                                {transaction.amount.toFixed(transaction.currency === "Bitcoin" ? 5 : 2)}{" "}
                                {transaction.currency === "Bitcoin" ? "BTC" : transaction.currency}
                              </p>
                              <div className="flex items-center gap-1">
                                {transaction.status === "completed" && (
                                  <CheckCircle className="h-3 w-3 text-green-400" />
                                )}
                                <Badge
                                  variant={
                                    transaction.status === "completed"
                                      ? "default"
                                      : transaction.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTransaction(transaction)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-white">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    {transaction.type === "deposit" ? "Deposit Details" : "Transaction Details"}
                                  </DialogTitle>
                                  <DialogDescription className="text-gray-400">
                                    Complete information about this transaction
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {transaction.status === "pending" && transaction.estimatedCompletion && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-yellow-400" />
                                        <span className="font-medium text-yellow-300">Transaction Processing</span>
                                      </div>
                                      <p className="text-sm text-yellow-200 mb-3">
                                        Gas fee deposited - Transaction completing shortly
                                      </p>
                                      <Progress value={90} className="h-2 bg-yellow-900/20" />
                                    </div>
                                  )}

                                  {transaction.type === "deposit" ? (
                                    // Deposit specific details
                                    <>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Reference ID</Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs bg-white/5 p-2 rounded flex-1 break-all text-white">
                                              {transaction.referenceId}
                                            </code>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => copyToClipboard(transaction.referenceId || "")}
                                              className="text-gray-400 hover:text-white"
                                            >
                                              <Copy className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Payment Method</Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            <CreditCard className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-white">{transaction.paymentMethod}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {transaction.cardLast4 && (
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm font-medium text-gray-400">Card Details</Label>
                                            <p className="mt-1 text-sm text-white">
                                              {transaction.cardType} •••• {transaction.cardLast4}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-gray-400">Processing Fee</Label>
                                            <p className="mt-1 text-sm text-white">
                                              ${transaction.processingFee?.toFixed(2)} (0.5%)
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Amount Deposited</Label>
                                          <p className="mt-1 font-semibold text-lg text-blue-400">
                                            +${transaction.amount.toFixed(2)} USDT
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Net Amount</Label>
                                          <p className="mt-1 font-semibold text-lg text-white">
                                            ${(transaction.amount - (transaction.processingFee || 0)).toFixed(2)} USDT
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    // Regular transaction details
                                    <>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Transaction Hash</Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs bg-white/5 p-2 rounded flex-1 break-all text-white">
                                              {transaction.txHash}
                                            </code>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => copyToClipboard(transaction.txHash || "")}
                                              className="text-gray-400 hover:text-white"
                                            >
                                              <Copy className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Network</Label>
                                          <p className="mt-1 text-sm font-medium text-white">{transaction.network}</p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">
                                            {transaction.type === "send" ? "Recipient" : "Sender"}
                                          </Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs bg-white/5 p-2 rounded flex-1 break-all text-white">
                                              {transaction.recipient || transaction.sender}
                                            </code>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                copyToClipboard(transaction.recipient || transaction.sender || "")
                                              }
                                              className="text-gray-400 hover:text-white"
                                            >
                                              <Copy className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Confirmations</Label>
                                          <p className="mt-1 font-mono text-sm text-white">
                                            {transaction.status === "pending"
                                              ? "0/6"
                                              : `${transaction.confirmations}/6`}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Amount</Label>
                                          <p className="mt-1 font-semibold text-lg text-white">
                                            {transaction.amount.toFixed(transaction.currency === "Bitcoin" ? 5 : 2)}{" "}
                                            {transaction.currency === "Bitcoin" ? "BTC" : transaction.currency}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Gas Fee</Label>
                                          <p className="mt-1 text-sm text-white">
                                            {transaction.networkFee}{" "}
                                            {transaction.currency === "Bitcoin" ? "BTC" : "TON"}
                                          </p>
                                        </div>
                                      </div>

                                      {transaction.blockHeight && (
                                        <div>
                                          <Label className="text-sm font-medium text-gray-400">Block Height</Label>
                                          <p className="mt-1 font-mono text-sm text-white">{transaction.blockHeight}</p>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-400">Date & Time</Label>
                                      <p className="mt-1 text-sm text-white">
                                        {formatDate(transaction.timestamp).date} at{" "}
                                        {formatDate(transaction.timestamp).time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>TON Network Deposit</DialogTitle>
            <DialogDescription>
              Scan the QR code or copy the address and memo to deposit TON or USDT on TON network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-400">Deposit Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-white/5 p-3 rounded flex-1 break-all text-white">
                  {TON_DEPOSIT_ADDRESS}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(TON_DEPOSIT_ADDRESS)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-400">Memo (Required)</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-white/5 p-3 rounded flex-1 text-white">{TON_DEPOSIT_MEMO}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(TON_DEPOSIT_MEMO)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-yellow-300 mt-1">
                ⚠️ Important: Always include the memo when sending to ensure proper crediting
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-300 font-medium">Important Notes</span>
              </div>
              <ul className="text-xs text-yellow-200 space-y-1">
                <li>• Only send TON or USDT on TON network to this address</li>
                <li>• Always include the memo: {TON_DEPOSIT_MEMO}</li>
                <li>• Minimum deposit: $10 USDT equivalent</li>
                <li>• Deposits typically confirm within 1-2 minutes</li>
                <li>• TON is required for all transaction gas fees</li>
                <li>• Click refresh button after deposit to update balance</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  const depositInfo = `Address: ${TON_DEPOSIT_ADDRESS}\nMemo: ${TON_DEPOSIT_MEMO}`
                  copyToClipboard(depositInfo)
                }}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button
                onClick={() => setShowDepositDialog(false)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gas Fee Payment Dialog */}
      <Dialog open={showGasFeeDialog} onOpenChange={setShowGasFeeDialog}>
        <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Gas Fee Payment</DialogTitle>
            <DialogDescription>You are about to pay the gas fee to initiate the transfer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Fee:</span>
                  <span className="text-white">
                    {getSelectedNetworkInfo() ? (getSelectedNetworkInfo()!.fee / TON_PRICE).toFixed(2) : "0"} TON
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">USD Value:</span>
                  <span className="text-white">≈${getSelectedNetworkInfo()?.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current TON Balance:</span>
                  <span className={`${hasEnoughTonForGas() ? "text-green-400" : "text-red-400"}`}>
                    {getTonBalance().toFixed(2)} TON
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              The gas fee will be deducted from your TON balance. Your transaction will complete instantly after
              payment.
            </p>

            <Button
              onClick={handleGasFeePayment}
              disabled={!hasEnoughTonForGas()}
              className={`w-full ${
                hasEnoughTonForGas()
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  : "bg-gray-600 cursor-not-allowed"
              } text-white`}
            >
              {hasEnoughTonForGas() ? "Confirm Gas Fee Payment" : "Insufficient TON Balance"}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:text-white"
              onClick={() => setShowGasFeeDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
