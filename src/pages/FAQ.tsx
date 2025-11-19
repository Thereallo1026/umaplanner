import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

interface FAQItem {
	question: string;
	answer: string | React.ReactNode;
}

const faqs: FAQItem[] = [
	{
		question: "What is Umaplanner?",
		answer: "Umaplanner is a resource planning tool for Uma Musume Pretty Derby. It helps you calculate how many pulls you can afford based on your current resources and monthly income from various in-game activities.",
	},
	{
		question: "How do I use the planner?",
		answer: "Enter your current carats, tickets, and select your monthly income sources (club rank, class rank, Champion's Meeting placement, etc.). The planner will automatically calculate how many pulls you can make by each banner date.",
	},
	{
		question: "What do the different fields mean?",
		answer: (
			<div className="space-y-2">
				<p><strong className="text-white">Carats:</strong> Your current premium currency</p>
				<p><strong className="text-white">Uma Tickets:</strong> Character gacha tickets</p>
				<p><strong className="text-white">Support Tickets:</strong> Support card gacha tickets</p>
				<p><strong className="text-white">Club Rank:</strong> Your monthly ranking reward tier in Club Races</p>
				<p><strong className="text-white">Team Trials Class:</strong> Your class in Team Trials</p>
				<p><strong className="text-white">Champion's Meeting:</strong> Your ranking reward tier in Champion's Meeting</p>
			</div>
		),
	},
	{
		question: "How accurate are the projections?",
		answer: "The projections are based on consistent monthly income and don't account for special events, campaigns, or one-time rewards. Use them as a general estimate for planning purposes.",
	},
	{
		question: "Why are some banners grayed out?",
		answer: "Grayed out banners are past banners that are no longer available. You can view them by clicking the 'Past Banners' button.",
	},
	{
		question: "What does the 'Live' badge mean?",
		answer: "The 'Live' badge indicates that a banner is currently active in the game and available for pulling.",
	},
	{
		question: "Where does the banner data come from?",
		answer: "Banner data is sourced from umaplanner.horse, which maintains an up-to-date database of all Uma Musume banners and their schedules.",
	},
	{
		question: "Can I save my planner configuration?",
		answer: "Currently, your configuration is stored in your browser's local storage. It will persist across sessions on the same device and browser.",
	},
	{
		question: "Is this app affiliated with Cygames?",
		answer: "No, this is an independent fan-made tool. It is not affiliated with or endorsed by Cygames, Inc. All trademarks and copyrights belong to Cygames.",
	},
	{
		question: "The app isn't working or I found a bug. What should I do?",
		answer: (
			<>
				Please DM me on Discord at <strong className="text-white font-mono">thereallo</strong> with details about the issue you're experiencing. You can also open an issue on the GitHub repository.
			</>
		),
	},
	{
		question: "Can I contribute to this project?",
		answer: (
			<>
				Yes! This is an open-source project. You can find the source code on{" "}
				<a
					href="https://github.com/thereallo1026/umaplanner"
					target="_blank"
					rel="noreferrer"
					className="text-white hover:text-zinc-300 underline decoration-zinc-600 underline-offset-2 transition-colors"
				>
					GitHub
				</a>
				{" "}and submit pull requests or suggestions.
			</>
		),
	},
];

export default function FAQ() {
	return (
		<div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-white selection:text-black">
			<div className="sticky top-0 z-50 border-b border-[#333] bg-black/80 backdrop-blur-md supports-backdrop-filter:bg-black/60">
				<div className="container mx-auto px-6 h-14 flex justify-between items-center">
					<Link to="/" className="flex items-center gap-2 group">
						<img src="/logo.svg" alt="Logo" className="h-8 w-8" />
						<span className="font-semibold text-xl tracking-tight text-white group-hover:text-zinc-300 transition-colors">
							Umaplanner
						</span>
					</Link>
				</div>
			</div>

			<main className="flex-1 container mx-auto px-6 py-12">
				<div className="max-w-3xl mx-auto space-y-8">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors mb-2"
					>
						<Icon icon="mdi:arrow-left" width={16} />
						Back to Home
					</Link>

					<div className="space-y-3">
						<h1 className="text-4xl font-bold tracking-tight">
							Frequently Asked Questions
						</h1>
						<p className="text-[#888] text-lg">
							Find answers to common questions about Umaplanner
						</p>
					</div>

					<div className="space-y-6">
						{faqs.map((faq, index) => (
							<div
								key={index}
								className="bg-[#0A0A0A] border border-[#333] rounded-lg p-6 hover:border-[#666] transition-colors"
							>
								<h2 className="text-lg font-semibold text-white mb-3 flex items-start gap-3">
									<Icon
										icon="mdi:help-circle-outline"
										width={20}
										className="text-[#888] mt-0.5 shrink-0"
									/>
									{faq.question}
								</h2>
								<div className="text-[#888] leading-relaxed ml-8">
									{faq.answer}
								</div>
							</div>
						))}
					</div>

					<div className="bg-[#111] border border-[#333] rounded-lg p-8 text-center space-y-4">
						<Icon
							icon="mdi:message-text-outline"
							width={32}
							className="text-white mx-auto"
						/>
						<h2 className="text-xl font-semibold">Still have questions?</h2>
						<p className="text-[#888] max-w-md mx-auto">
							Feel free to reach out if you have any other questions or need
							assistance. DM me on Discord at{" "}
							<span className="text-white font-mono font-semibold">
								thereallo
							</span>
                            .
						</p>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
