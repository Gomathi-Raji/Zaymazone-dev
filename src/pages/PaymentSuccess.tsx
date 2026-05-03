import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ENV } from "@/config/env";
import { CheckCircle, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Order } from "@/lib/api";
import { analytics } from "@/lib/analytics";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get payment details from URL params
  const zohoPaymentId = searchParams.get('payment_id');
  const zohoOrderId = searchParams.get('order_id');
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!zohoPaymentId || !zohoOrderId) {
        setError('Invalid payment parameters');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify payment with backend
        const verificationResult = await api.verifyPayment({
          zohoPaymentId,
          zohoOrderId,
          paymentStatus: status || 'unknown'
        });

        if (verificationResult.success) {
          setPaymentStatus(verificationResult.paymentStatus === 'paid' ? 'success' : 'failed');
          
          // Track purchase event for successful payments
          if (verificationResult.paymentStatus === 'paid') {
            analytics.purchase(
              zohoOrderId || 'unknown',
              0, // We'll need to get the actual amount from somewhere else
              [] // We'll need to get the actual items from somewhere else
            );
          }
          
          // Fetch order details
          try {
            // We need to find the order by zohoOrderId
            // For now, we'll use the order info from verification
            toast({
              title: verificationResult.paymentStatus === 'paid' ? "Payment Successful!" : "Payment Failed",
              description: verificationResult.message,
              variant: verificationResult.paymentStatus === 'paid' ? "default" : "destructive"
            });
          } catch (orderError) {
            console.error('Error fetching order:', orderError);
          }
        } else {
          setPaymentStatus('failed');
          setError('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        setError(error instanceof Error ? error.message : 'Payment verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [zohoPaymentId, zohoOrderId, status, toast]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Pending';
    }
  };

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Your payment has been processed successfully. Your order is confirmed and will be shipped soon.';
      case 'failed':
        return error || 'Your payment could not be processed. Please try again or contact support.';
      default:
        return 'Your payment is being processed. Please wait...';
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Payment</h1>
                <p className="text-muted-foreground text-center">
                  Please wait while we verify your payment...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              {getStatusIcon()}
              
              <h1 className="text-3xl font-bold text-foreground mt-6 mb-2">
                {getStatusTitle()}
              </h1>
              
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {getStatusDescription()}
              </p>

              {paymentStatus === 'success' && (
                <div className="w-full max-w-md space-y-4 mb-6">
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {zohoPaymentId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {zohoOrderId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                {paymentStatus === 'success' ? (
                  <>
                    <Button 
                      onClick={() => navigate('/orders')}
                      className="flex-1"
                    >
                      View Orders
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/products')}
                      className="flex-1"
                    >
                      Continue Shopping
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => navigate('/checkout')}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/products')}
                      className="flex-1"
                    >
                      Continue Shopping
                    </Button>
                  </>
                )}
              </div>

              {paymentStatus === 'failed' && (ENV.supportEmail || ENV.supportPhone) && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Need help?</strong> Contact our support team at{' '}
                    {ENV.supportEmail ? (
                      <a href={`mailto:${ENV.supportEmail}`} className="underline">
                        {ENV.supportEmail}
                      </a>
                    ) : null}
                    {ENV.supportEmail && ENV.supportPhone ? ' or call ' : null}
                    {ENV.supportPhone ? (
                      <a href={`tel:${ENV.supportPhone}`} className="underline">
                        {ENV.supportPhone}
                      </a>
                    ) : null}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}