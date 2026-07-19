"use client";
import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";

const faqs = [
 {
 title: "What is RAG?",
 content: "RAG stands for Retrieval-Augmented Generation, a technology that combines AI language models with your specific documents and data. Instead of relying solely on pre-trained knowledge, RAG allows the AI to search through your uploaded files and generate responses based on your actual content, which means vault can provide accurate, cited answers directly from your documents rather than general information.",
 },
 {
 title: "How does vault ensure my data stays completely private?",
 content: "Vault runs entirely on private cloud infrastructure with zero external connections. Your files are processed locally on local hardware, and no data is ever transmitted to external servers, third parties, or cloud services. It's a completely air-gapped solution.",
 },
 {
 title: "What file types does vault support?",
 content: "Vault processes all major file formats including PDFs, Word documents, Excel spreadsheets, PowerPoint presentations, images, scanned documents, source code files, and technical documentation. It can extract text from handwritten notes and understand complex document structures.",
 },
 {
 title: "How do I get my files into vault?",
 content: "Simply upload files directly through the vault admin panel. There are no integrations with external systems, all files must be manually uploaded to maintain complete security and privacy. This ensures your data never leaves the controlled environment.",
 },
 {
 title: "Can vault connect to our existing systems?",
 content: "No, vault does not integrate with any external systems or third-party platforms. This is by design to ensure complete data privacy. All files must be uploaded directly to maintain the air-gapped security model that keeps your data completely isolated.",
 },
 {
 title: "How quickly can vault be deployed?",
 content: "Typical on-premise deployment takes 2-4 weeks depending on your hardware setup. Our team handles the complete installation on your infrastructure, including hardware optimization, security configuration, and user training.",
 },
 {
 title: "What are the hardware requirements for vault?",
 content: "Vault requires dedicated GPU hardware for optimal performance. We provide detailed specifications during the sales process and can recommend hardware configurations based on your expected usage and file volume.",
 },
 {
 title: "How many users can access vault simultaneously?",
 content: "Vault supports multiple concurrent users with role-based access controls. The exact number depends on your hardware configuration and usage patterns. We help size the system appropriately during deployment planning.",
 },
 {
 title: "What is the difference between chat mode and code mode?",
 content: "Chat mode is designed for business documents, reports, contracts, and general file analysis. Code mode is optimized for source code, technical documentation, and development-related files. You can easily switch between modes based on what you're working with in the settings.",
 },
 {
 title: "How accurate is vault's analysis?",
 content: "Vault uses advanced RAG (Retrieval-Augmented Generation) technology with models specifically optimized for document and code comprehension. It provides citations and references for all responses, allowing you to verify accuracy against source materials.",
 },
 {
 title: "Can I customize vault for my organization's specific needs?",
 content: "Yes, we offer white label customization for $10K per month, which includes custom branding and interface modifications. The AI can also learn your organization's specific terminology and document structures over time.",
 },
 {
 title: "What happens if I need technical support?",
 content: "All vault deployments include comprehensive support via phone, email, and secure chat. On-premise installations include ongoing maintenance, security updates, and technical assistance from our dedicated support team.",
 },

 {
 title: "Is vault compliant with industry regulations?",
 content: "Vault's private deployment model supports compliance with HIPAA, SOC II, GDPR, and other regulatory frameworks. Since all processing happens within your controlled environment, it helps meet data residency and processing requirements.",
 },
 {
 title: "What training is provided for users?",
 content: "All deployments include comprehensive user training covering both chat mode and code mode functionality. We provide live training sessions, documentation, and ongoing support to ensure your team can effectively use the platform.",
 },
 {
 title: "Can vault handle multiple languages?",
 content: "Yes, vault supports document processing and analysis in multiple languages, making it suitable for global organizations with diverse document collections.",
 },
 {
 title: "What if we want to upgrade our hardware later?",
 content: "Vault is designed to scale with your needs. We can help you upgrade hardware or add additional processing power as your usage grows. The software architecture supports both vertical and horizontal scaling.",
 },
 {
 title: "What happens to our data if we stop using vault?",
 content: "Since Vault operates entirely on private infrastructure, all your data remains under your complete control. You can export, archive, or manage your files as needed. There's no vendor lock-in or external data dependencies.",
 },
];

export default function Component() {
 return (
 <section className="mx-auto w-full max-w-6xl px-0 py-20 md:px-6 lg:px-8 ">
 <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
 <h2 className="px-2 text-3xl self-center mb-12 leading-7">
 <span className="inline-block md:hidden">FAQs</span>
 <span className="hidden md:inline-block">
 Frequently Asked Questions
 </span>
 </h2>
 <Accordion
 fullWidth
 keepContentMounted
 className="gap-3"
 itemClasses={{
 base: "px-6 !bg-default-100 !shadow-none hover:!bg-default-200/50",
 title: "font-medium",
 trigger: "py-6",
 content: "pt-0 pb-6 text-base text-default-500",
 }}
 items={faqs}
 selectionMode="multiple"
 variant="splitted"
 >
 {faqs.map((item, i) => (
 <AccordionItem
 key={i}
 indicator={<Icon icon="lucide:plus" width={24} />}
 title={item.title}
 >
 {item.content}
 </AccordionItem>
 ))}
 </Accordion>
 </div>
 </section>
 );
}
