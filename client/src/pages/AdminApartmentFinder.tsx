import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ApartmentFinderSubmission } from "@shared/schema";
import { ArrowLeft, Loader2, Mail, Phone, Calendar, DollarSign, Home, Car, PawPrint } from "lucide-react";
import { format } from "date-fns";

export default function AdminApartmentFinder() {
  const { toast } = useToast();
  const { isLoading: adminLoading, isAdmin } = useAdminAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<ApartmentFinderSubmission | null>(null);

  const { data: submissions, isLoading } = useQuery<ApartmentFinderSubmission[]>({
    queryKey: ["/api/apartment-finder"],
    enabled: isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "unread" | "contacted" }) => {
      return await apiRequest("PATCH", `/api/apartment-finder/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apartment-finder"] });
      toast({
        title: "Status Updated",
        description: "Submission status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const unreadCount = submissions?.filter(s => s.status === "unread").length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" data-testid="button-back-admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">
            Apartment Finder Submissions
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-description">
            Manage and respond to apartment finder applications
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Submissions Yet</CardTitle>
              <CardDescription>
                When people submit the apartment finder form, their applications will appear here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Submissions
                {unreadCount > 0 && (
                  <Badge variant="default" data-testid="badge-unread-count">
                    {unreadCount} Unread
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Preferences</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Move-in</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} data-testid={`row-submission-${submission.id}`}>
                      <TableCell>
                        <Badge
                          variant={submission.status === "unread" ? "default" : "secondary"}
                          data-testid={`badge-status-${submission.id}`}
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-name-${submission.id}`}>
                        {submission.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {submission.email}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {submission.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{submission.preferredArea}</div>
                          <div className="text-muted-foreground">
                            {submission.minBedrooms} bed / {submission.minBathrooms} bath
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-budget-${submission.id}`}>
                        ${submission.maxBudget.toLocaleString()}
                      </TableCell>
                      <TableCell>{submission.moveInMonth}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                            data-testid={`button-view-${submission.id}`}
                          >
                            View
                          </Button>
                          {submission.status === "unread" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: submission.id, status: "contacted" })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-mark-contacted-${submission.id}`}
                            >
                              Mark Contacted
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Full details of the apartment finder application
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-medium">{selectedSubmission.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedSubmission.email}`} className="text-primary hover:underline">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedSubmission.phone}`} className="text-primary hover:underline">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Apartment Preferences</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Area:</span>{" "}
                    <span>{selectedSubmission.preferredArea}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>{" "}
                    <span>{selectedSubmission.minBedrooms} bedrooms, {selectedSubmission.minBathrooms} bathrooms minimum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Max Budget:</span>{" "}
                    <span className="font-medium">${selectedSubmission.maxBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Move-in:</span>{" "}
                    <span>{selectedSubmission.moveInMonth}</span>
                  </div>
                </div>
              </div>

              {selectedSubmission.amenities && (
                <div>
                  <h3 className="font-semibold mb-2">Desired Amenities</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.amenities}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Additional Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Pet:</span>{" "}
                    <span>
                      {selectedSubmission.hasPet 
                        ? selectedSubmission.petDetails || "Yes" 
                        : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Car:</span>{" "}
                    <span>{selectedSubmission.hasCar ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {selectedSubmission.additionalInfo && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Information</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.additionalInfo}</p>
                </div>
              )}

              <div className="pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Submitted on {format(new Date(selectedSubmission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
                {selectedSubmission.status === "unread" && (
                  <Button
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedSubmission.id, status: "contacted" });
                      setSelectedSubmission(null);
                    }}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-mark-contacted-dialog"
                  >
                    Mark as Contacted
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
