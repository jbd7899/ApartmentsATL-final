import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertApartmentFinderSubmissionSchema } from "@shared/schema";
import { Loader2, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  preferredArea: z.string().min(1, "Please select a preferred area"),
  minBedrooms: z.string().min(1, "Please select minimum bedrooms"),
  minBathrooms: z.string().min(1, "Please select minimum bathrooms"),
  amenities: z.string().optional(),
  maxBudget: z.number().min(1450, "Maximum budget must be at least $1450"),
  moveInMonth: z.string().min(1, "Please select move-in month"),
  hasPet: z.boolean(),
  petDetails: z.string().optional(),
  hasCar: z.boolean(),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ApartmentFinder() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredArea: "",
      minBedrooms: "",
      minBathrooms: "",
      amenities: "",
      maxBudget: 1450,
      moveInMonth: "",
      hasPet: false,
      petDetails: "",
      hasCar: false,
      additionalInfo: "",
    },
  });

  const hasPet = form.watch("hasPet");

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Transform form data to match backend schema
      const submissionData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferredArea: data.preferredArea,
        minBedrooms: data.minBedrooms,
        minBathrooms: data.minBathrooms,
        amenities: data.amenities || null,
        maxBudget: data.maxBudget,
        moveInMonth: data.moveInMonth,
        hasPet: data.hasPet,
        petDetails: data.petDetails || null,
        hasCar: data.hasCar,
        additionalInfo: data.additionalInfo || null,
      };
      return await apiRequest("POST", "/api/apartment-finder", submissionData);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll email you back with available apartments that fit your needs.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Thank You!</CardTitle>
              <CardDescription>
                Your apartment finder application has been submitted successfully.
                We'll review your requirements and email you back with available apartments that fit your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  form.reset();
                }}
                className="w-full"
                data-testid="button-submit-another"
              >
                Submit Another Application
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Apartment Finder</h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-description">
            Submit this application and we will email you back with the available apartments that fit your needs
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@example.com" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="(555) 123-4567" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Apartment Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferredArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which area do you prefer? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-area">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Midtown">Midtown</SelectItem>
                          <SelectItem value="Virginia Highland">Virginia Highland</SelectItem>
                          <SelectItem value="No Preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minBedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Bedrooms *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-bedrooms">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4+">4+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minBathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Bathrooms *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-bathrooms">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="2.5">2.5</SelectItem>
                            <SelectItem value="3+">3+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maxBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Budget (minimum $1450) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1450"
                          placeholder="2000"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-budget"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="moveInMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When would you like to move in? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-move-in">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What amenities are you looking for?</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="e.g., In-unit laundry, parking, hardwood floors, dishwasher..."
                          className="min-h-24"
                          data-testid="textarea-amenities"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasPet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have a pet? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="pet-yes" data-testid="radio-pet-yes" />
                            <FormLabel htmlFor="pet-yes" className="font-normal cursor-pointer">
                              Yes
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="pet-no" data-testid="radio-pet-no" />
                            <FormLabel htmlFor="pet-no" className="font-normal cursor-pointer">
                              No
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasPet && (
                  <FormField
                    control={form.control}
                    name="petDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Details (age/weight/breed)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="e.g., 3 years old, 25 lbs, Beagle"
                            data-testid="input-pet-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="hasCar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have a car? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="car-yes" data-testid="radio-car-yes" />
                            <FormLabel htmlFor="car-yes" className="font-normal cursor-pointer">
                              Yes
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="car-no" data-testid="radio-car-no" />
                            <FormLabel htmlFor="car-no" className="font-normal cursor-pointer">
                              No
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional information we may find helpful to assist you</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Any other information that might help us find the perfect apartment for you..."
                          className="min-h-24"
                          data-testid="textarea-additional-info"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                size="lg"
                data-testid="button-submit-form"
              >
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
