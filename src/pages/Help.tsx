import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle,
  ShoppingBag,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  Shield
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "orders", name: "Orders & Shipping", icon: Package },
    { id: "payments", name: "Payments & Billing", icon: CreditCard },
    { id: "returns", name: "Returns & Refunds", icon: RotateCcw },
    { id: "account", name: "Account & Security", icon: Shield },
    { id: "shopping", name: "Shopping Help", icon: ShoppingBag }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our website or the carrier's website. You can also view all your orders and their status in your account dashboard.",
      category: "orders"
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and cash on delivery (COD) for select locations. All payments are processed securely through our encrypted payment gateway.",
      category: "payments"
    },
    {
      id: 3,
      question: "Can I return or exchange an item?",
      answer: "Yes, we accept returns within 30 days of delivery. Items must be in original condition with tags attached. Handmade items are generally non-returnable unless they arrive damaged. Please contact our support team to initiate a return.",
      category: "returns"
    },
    {
      id: 4,
      question: "How long does shipping take?",
      answer: "Domestic shipping typically takes 3-7 business days, while international shipping takes 10-15 business days. Express shipping options are available for faster delivery. Shipping times may vary based on location and availability.",
      category: "orders"
    },
    {
      id: 5,
      question: "Are the products authentic handmade items?",
      answer: "Yes, all our products are authentic handmade crafts created by verified artisans. Each item comes with information about the artisan and the traditional techniques used. We visit our artisan partners regularly to ensure quality and authenticity.",
      category: "shopping"
    },
    {
      id: 6,
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button in the top navigation. You can create an account using your email address or sign up through social media accounts like Google or Facebook. Creating an account helps you track orders and save favorites.",
      category: "account"
    },
    {
      id: 7,
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination. International customers are responsible for any customs duties or taxes imposed by their country.",
      category: "orders"
    },
    {
      id: 8,
      question: "How can I contact customer support?",
      answer: "You can reach us through multiple channels: email at support@zaymazone.com, phone at +1-800-CRAFTS, live chat on our website, or through the contact form below. Our support team is available Monday-Friday, 9 AM-6 PM EST.",
      category: "account"
    },
    {
      id: 9,
      question: "What if my item arrives damaged?",
      answer: "If your item arrives damaged, please contact us within 48 hours with photos of the damage. We'll arrange for a replacement or full refund immediately. We package all items carefully, but sometimes damage can occur during shipping.",
      category: "returns"
    },
    {
      id: 10,
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 2 hours of placement. After that, orders enter processing and cannot be cancelled. If you need to cancel an order that's already processing, please contact support immediately.",
      category: "orders"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">How Can We Help You?</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions, get support, or contact our team directly. 
            We're here to help you have the best experience shopping for traditional crafts.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search for help topics..." 
            className="pl-12 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Get instant help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Chat</Button>
              <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Available 24/7</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader>
              <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle>Call Us</CardTitle>
              <CardDescription>Speak directly with a support agent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-foreground mb-2">+1-800-CRAFTS</p>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Mon-Fri, 9 AM-6 PM EST</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader>
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Send us a detailed message</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-foreground mb-2">support@zaymazone.com</p>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Response within 24 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Help Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  {filteredFaqs.length} questions found
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="ml-2">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or browse different categories
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Still Need Help?</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What can we help you with?" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please describe your question or issue in detail..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;