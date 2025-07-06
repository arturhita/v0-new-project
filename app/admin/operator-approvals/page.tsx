"use client"

import { useEffect, useState, useTransition } from "react"
import {
  getOperatorApplications,
  approveApplication,
  rejectApplication,
  type OperatorApplication,
} from "@/lib/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export default function OperatorApprovalsPage() {
  const [applications, setApplications] = useState<OperatorApplication[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(true)
    getOperatorApplications()
      .then((data) => {
        setApplications(data)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || "An unknown error occurred.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleApprove = (applicationId: string, userId: string) => {
    startTransition(async () => {
      const result = await approveApplication(applicationId, userId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Operator application approved.",
        })
        setApplications((prev) => prev.filter((app) => app.id !== applicationId))
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const handleReject = (applicationId: string) => {
    startTransition(async () => {
      const result = await rejectApplication(applicationId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Operator application rejected.",
        })
        setApplications((prev) => prev.filter((app) => app.id !== applicationId))
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Operator Approvals</CardTitle>
          <CardDescription>Review and manage pending operator applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No pending applications found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.profile?.name || "N/A"}</TableCell>
                    <TableCell>{app.profile?.email || "N/A"}</TableCell>
                    <TableCell>{app.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {app.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(app.id, app.user_id)} disabled={isPending}>
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
