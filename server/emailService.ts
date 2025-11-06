import { Resend } from 'resend';
import type { ApartmentFinderSubmission } from '@shared/schema';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApartmentFinderNotification(submission: ApartmentFinderSubmission): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured');
    return;
  }

  const petInfo = submission.hasPet && submission.petDetails 
    ? `Yes - ${submission.petDetails}` 
    : 'No';

  const carInfo = submission.hasCar ? 'Yes' : 'No';

  const htmlContent = `
    <h2>New Apartment Finder Submission</h2>
    <p>You have received a new apartment inquiry:</p>
    
    <h3>Contact Information</h3>
    <ul>
      <li><strong>Name:</strong> ${submission.name}</li>
      <li><strong>Email:</strong> ${submission.email}</li>
      <li><strong>Phone:</strong> ${submission.phone}</li>
    </ul>

    <h3>Preferences</h3>
    <ul>
      <li><strong>Preferred Area:</strong> ${submission.preferredArea}</li>
      <li><strong>Minimum Bedrooms:</strong> ${submission.minBedrooms}</li>
      <li><strong>Minimum Bathrooms:</strong> ${submission.minBathrooms}</li>
      <li><strong>Max Budget:</strong> $${submission.maxBudget}</li>
      <li><strong>Move-in Month:</strong> ${submission.moveInMonth}</li>
    </ul>

    <h3>Additional Details</h3>
    <ul>
      <li><strong>Pet:</strong> ${petInfo}</li>
      <li><strong>Car:</strong> ${carInfo}</li>
    </ul>

    ${submission.amenities ? `
    <h3>Desired Amenities</h3>
    <p>${submission.amenities}</p>
    ` : ''}

    ${submission.additionalInfo ? `
    <h3>Additional Information</h3>
    <p>${submission.additionalInfo}</p>
    ` : ''}

    <p><small>Submitted on ${new Date(submission.submittedAt).toLocaleString()}</small></p>
  `;

  try {
    await resend.emails.send({
      from: 'Apartment Finder <onboarding@resend.dev>',
      to: adminEmail,
      subject: `New Apartment Inquiry - ${submission.name}`,
      html: htmlContent,
    });
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
}
