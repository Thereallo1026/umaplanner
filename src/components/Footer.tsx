import { Link } from "react-router-dom";
import Dither from "@/components/bits/dither";

export function Footer() {
	const currentYear = new Date().getFullYear();

	const footerLinks = [
		{ label: "Planner", href: "/", external: false },
		{ label: "FAQ", href: "/faq", external: false },
		{ label: "GitHub", href: "https://github.com/thereallo1026/umaplanner", external: true },
	];

	return (
		<footer className="relative border-t border-zinc-800 py-12 mt-auto overflow-hidden">
			<div className="absolute inset-0 h-full w-full z-15 bg-linear-to-b from-black/50 to-black/70" />
			<div className="absolute inset-0 h-full w-full z-10">
				<Dither
					waveColor={[0.5, 0.5, 0.5]}
					disableAnimation={false}
					enableMouseInteraction={false}
					mouseRadius={0.3}
					colorNum={4}
					waveAmplitude={0.3}
					waveFrequency={3}
					waveSpeed={0.05}
				/>
			</div>

			<div className="relative z-20 container mx-auto px-6 flex flex-col md:flex-row justify-between md:items-end gap-6">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<img
							src="/logo.svg"
							alt="Umaplanner Logo"
							className="h-6 w-6"
							loading="lazy"
						/>
						<span className="font-semibold text-xl tracking-tight text-white drop-shadow-md">
							Umaplanner
						</span>
					</div>

					<div className="flex flex-col gap-1 text-sm text-zinc-300">
						<p className="drop-shadow-sm">
							&copy; {currentYear}{" "}
							<a
								href="https://thereallo.dev"
								target="_blank"
								rel="noreferrer"
								className="text-white hover:text-zinc-200 transition-colors"
							>
								Thereallo LLC
							</a>
						</p>

						<div className="text-xs flex flex-col gap-0.5 text-zinc-400">
							<p className="max-w-md leading-relaxed drop-shadow-sm">
								Not affiliated with the developers of Uma Musume.
							</p>
							<p className="max-w-md leading-relaxed drop-shadow-sm">
								All trademarks and copyrights belong to Cygames, Inc.
							</p>
							<p className="max-w-md leading-relaxed drop-shadow-sm">
								Data via{" "}
								<a
									href="https://umaplanner.horse"
									target="_blank"
									rel="noreferrer"
									className="text-zinc-300 hover:text-white transition-colors underline decoration-zinc-600 underline-offset-2"
								>
									umaplanner.horse
								</a>
								.
							</p>
						</div>
					</div>
				</div>

				<nav aria-label="Footer Navigation">
					<ul className="flex gap-1">
						{footerLinks.map((link) => {
							const linkClassName = "text-xs font-medium uppercase hover:bg-white/20 py-1.5 px-3.5 rounded-md text-white/50 hover:text-white transition-colors duration-200";
							
							return (
								<li key={link.label}>
									{link.external ? (
										<a
											href={link.href}
											target="_blank"
											rel="noreferrer"
											className={linkClassName}
										>
											{link.label}
										</a>
									) : (
										<Link 
											to={link.href} 
											className={linkClassName}
											onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
										>
											{link.label}
										</Link>
									)}
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</footer>
	);
}
