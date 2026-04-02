---
title: "Weekly Dose of Optimism #180"
date: 2026-02-13
url: https://www.notboring.co/p/weekly-dose-of-optimism-180
word_count: 2987
---

Hi friends 👋 ,

Happy Friday from sunny Cape Town, South Africa! Not sure if it’s escaping frozen New York for warmer weather, spending time with family, or the fact that this was another one of the wildest weeks in Dose history, but I am feeling a little extra optimistic this week. By the end of this one, I hope you are too.

When Dan an I started writing this over three years ago, our goal was to make the world more optimistic by sharing all of the incredible progress happening in science and technology each week. That is still the case, and it’s still necessary. People are still pessimistic, and uncertain about what lies on the other side of progress.

Since we started writing, what’s changed is that things are simply moving much faster. There is more to cover each week. We have 7 Extra Doses in this one; each could be one of the top 5, and there are still things we didn’t cover.

So now, there’s an additional goal with the Dose: to keep you up-to-speed with the most important things happening in science and technology in the time it takes you two finish two morning coffees. Don’t doomscroll to keep up, just read the Dose.

Let’s get to it.

#### Today’s Weekly Dose is brought to you by… the Abundance Institute

*My friends at the Abundance Institute are launching “Everyday Abundance,” a new podcast, this spring hosted by best selling authors Virginia Postrel and Charles Mann. I had a **fascinating **conversation about tissue paper, sneezing, and germs with Virginia and Charles at the Progress Conference in October and I’m pretty exited to listen to the show.*

*If you join Abundance’s Foundry now, you’ll get access to a salon Zoom with Virginia, early access to the podcast, and **3 months of not boring world free[1](#footnote-1)**, on top of all the other benefits of supporting this amazing organization.*

*Check out the Foundry membership here: **[Join the Foundry](https://abundance.institute/foundryfeb)***

**(1) [Isomorphic Labs Drug Design Engine unlocks a new frontier beyond AlphaFold](https://www.isomorphiclabs.com/articles/the-isomorphic-labs-drug-design-engine-unlocks-a-new-frontier)**

*Isomorphic Labs*

AlphaFold won Demis Hassabis a Nobel Prize for predicting the structure of proteins, which felt like a technological miracle at the time, as captured in *The Thinking Game.*

This week, Hassabis’ Isomorphic Labs, the Google spinout he CEOs on Tuesdays while also running Google DeepMind, showed that they can now predict how to *drug* them in a technical report on IsoDDE, its AI drug design engine.

On the hardest protein-ligand structures (the ones most unlike anything in its training data, where AlphaFold 3 struggled) IsoDDE more than doubles AlphaFold3’s accuracy. It outperforms AlphaFold 3 by 2.3x on antibody-antigen modeling and Boltz-2 by nearly 20x. And it predicts how strongly a drug will bind to its target better than FEP+, the gold-standard physics simulation that typically costs orders of magnitude more in compute time.

It’s finding things quickly that have taken researchers over a decade. Cereblon is a protein that researchers spent 15 years believing had one druggable pocket. A 2026 paper experimentally discovered a second, hidden one. IsoDDE found both from the amino acid sequence alone, with no hints about what ligand to look for.

The big question from here is whether and how IsoDDE and other computational breakthroughs translate into actual drugs. As of early 2026, no AI-discovered drug has received FDA approval. AI-designed compounds are progressing to clinical trials at roughly the same success rates as traditionally discovered ones. Biology remains brutally unpredictable once you move from a screen to a human body.

Isomorphic Labs itself has pushed back its clinical trial timeline, now targeting end of 2026 for its first AI-designed drugs to enter human trials. So we’re still in the “proof of concept” phase for the whole field.

But to date, drug discovery's biggest bottleneck has been the staggering cost and time of *search*. It can takes a decade and billions of dollars per drug. Last year, Hassabis told 60 Minutes: “We can maybe reduce that down from years to maybe months or maybe even weeks.”

IsoDDE compresses the search phase from months of lab work to minutes of computation. If it can reliably surface the right targets and the right molecules faster, even if clinical trial timelines stay the same, you’re running dramatically more shots on goal for the same cost, and taking shots in weirder, harder-to-find pockets that humans would never think to (or at least have the time and resources to) try.

IsoDDE and other tools like it turn the front end of drug discovery from a slow, artisanal hunt into a fast, systematic search. One more bottleneck down. They’ll flood the clinical pipeline with better, more novel drug candidates, which creates another one. We are going to need to do something to accelerate clinical trials and FDA approvals to handle the flood.

**(2) [Gemini 3 Deep Think Crushes Benchmarks, Does Materials Science and Math](https://x.com/GoogleDeepMind/status/2021981510400709092?s=20)**

*Google DeepMind*

Look, I’m a simple man. If you include a video of a Duke lab in the announcement of your new model that “mogs” state-of-the-art models on ARC-AGI-2 (a test designed to be incredibly hard for AI), assists in cutting-edge materials science research, and helps mathematicians solve Erdős problems, I’m going to include it in the Dose. Go Duke.

Deep Think is GDM’s specialized reasoning mode within Gemini 3, designed to spend minutes (or longer) chewing on a single problem, exploring solution paths, backtracking when they don’t work, and building up multi-step chains of reasoning before committing to an answer. Google calls it “System 2” thinking, borrowing the Kahneman framing: where standard Gemini is fast and intuitive, Deep Think is slow and deliberate.

That deliberate approach pays off on benchmarks. Deep Think hit 84.6% on ARC-AGI-2 (the frontier reasoning benchmark, verified by ARC Prize), where the next closest model scored 68.8%. It achieved a 3455 Elo on Codeforces: for context, that puts it in the top tier of competitive programmers on Earth; it would rank 8th in the world. It set a new standard of 48.4% on Humanity's Last Exam, a benchmark designed to be the hardest collection of problems across math, science, and engineering. And it earned gold medal-level results on the written portions of the 2025 International Physics and Chemistry Olympiads.

It’s always hard to know what the benchmarks mean, though. Every time a big lab drops a new model, they beat some benchmarks.

Which is why the video with Duke University's Wang Lab is cool. In it, a researcher uses Deep Think to optimize the fabrication of MoS₂ monolayer thin films, a class of semiconductor materials that's notoriously difficult to grow at precise scales. The researcher prompts Deep Think with synthesis parameters, the model reasons through an optimized growth recipe, and then the system pipes those parameters directly into lab automation software that controls the furnace, gas flows, and temperature profiles. Deep Think designed a recipe for growing thin films larger than 100 μm, a precise target that previous methods had struggled to hit. The era of self-driving labs is upon us.

Meanwhile, collaborating with experts on 18 open research problems, Deep Think helped break long-standing deadlocks across computer science, information theory, and economics. It cracked classic algorithmic challenges like Max-Cut and Steiner Tree by pulling in mathematical tools from entirely unrelated fields, the kind of cross-domain intuition leap that's supposed to be uniquely human but which is basically what I expect a thinking machine with access to all human knowledge to do. Every time a new model drops, I ask it to tell me connections that humans have missed given its view across disciplines, and normally, it’s pretty weak. I’m excited to give Deep Think the test.

In another case, it caught a subtle logical flaw in a proof that had survived human peer review. In research-level mathematics, it autonomously generated a paper on structure constants in arithmetic geometry and collaborated with humans to prove bounds on interacting particle systems. And DeepMind ran it against 700 open problems from Bloom's Erdős Conjectures database, a collection of unsolved problems posed by Paul Erdős, one of the most prolific mathematicians in history, and autonomously solved several of them.

The coding stuff that gets twitter buzzing just doesn’t excite me that much. I didn’t buy a Mac Mini. The writing is still bad. But this stuff… helping humans solve hard problems and make new discoveries… this stuff I’m here for.

It’s a great time to be a researcher, and a [bad time to be a problem](https://www.youtube.com/watch?v=FDNkDBNR7AM).

**(3) [Introducing: Liberty Class](https://www.blw.ai/libertyclass)**

*Blue Water*

Speaking of problems that have seemed almost impossible for Americans to solve…

American shipbuilding numbers are almost comical. China’s shipbuilding capacity is 232 times greater than America’s. In 2024, Chinese yards built over 1,000 commercial vessels. The US built eight. China’s navy has over 370 battle force ships and is projected to hit 435 by 2030. The US Navy has 296 and is projected to shrink to 283 by 2027 as retirements outpace new construction. 37 of the 45 ships currently under construction face significant delays. America’s four public shipyards average 76 years old, with dry docks averaging over 107. As the Secretary of the Navy put it, one Chinese shipyard has more capacity than all American shipyards combined. You’ve seen the chart.

Good news. This week, Blue Water Autonomy unveiled the Liberty Class: a 190-foot autonomous steel ship with a range of over 10,000 nautical miles and 150+ metric tons of payload capacity. The name is a deliberate nod to the Liberty Ships of World War II, which were built rapidly and at scale to meet wartime demand. Blue Water is making a similar bet: take a proven hull design (Damen's Stan Patrol 6009, battle-tested in demanding conditions worldwide), re-engineer it from the inside out for autonomous operation, and start building at Conrad Shipyard in Louisiana next month. The first vessel is expected to be delivered to the US Navy later this year.

Blue Water developed Liberty entirely with private capital, which is unprecedented for a full-sized Navy ship, but standard in commercial markets. Working with over 100 suppliers, they went from founding in 2024 to construction start in 2026, and they're targeting serial production of 10-20 vessels per year. Conrad's five yards and 1,100-person workforce already produce 30+ ships annually, so the production capacity exists; now, it’s being put to more productive use.

It’s a good start, but we’re going to need like 1,000 of those eventually to catch up.

More good news on the autonomous boats front, then: [Saronic was selected for DARPA's Pulling Guard program](https://x.com/Saronic/status/2021223310726664277), which is developing semi-autonomous escort systems to protect logistics vessels at sea. Over 75% of global trade moves by water, and the Navy has historically protected those routes by deploying billion-dollar destroyers and carrier strike groups. Pulling Guard is exploring whether low-cost, modular autonomous platforms can provide distributed maritime protection, “protection as a service” that works in peacetime and conflict. Saronic, which has been building autonomous surface vessels and scaling manufacturing at speed, will design a modular, autonomy-enabled vessel under the program.

America's traditional shipbuilding apparatus is a cautionary tale in institutional sclerosis. But we love sclerosis here at not boring. Every sclerotic incumbent is an opportunity for a startup to build something better, faster, and cheaper. Ships ahoy.

(4) **[A small polymerase ribozyme that can synthesize itself and its complementary strand](https://www.science.org/doi/10.1126/science.adt2760)**

*Giannini, Kwok, Wan, Goeij, Clifton, Colizzi, Attwater, and Holliger in Science*

Stanford Medical Assistant Professor [Jason Sheltzer wrote a better lead-in than I could](https://x.com/JSheltzer/status/2022104604868309053?s=20): “AI is cool and all... but a new paper in Science Magazine kind of figured out the origin of life?”

Here's the backstory. The leading theory for how life began is the “RNA World” hypothesis: before DNA, before proteins, before cells, RNA molecules on early Earth stored genetic information *and* catalyzed chemical reactions. At some point, one of these RNA molecules figured out how to copy itself, and from that moment, evolution (descent with modification) could begin. The rest, over 4 billion years, is history.

The problem is that scientists have never been able to demonstrate this convincingly in the lab. Previous RNA enzymes (called ribozymes) that could copy other RNA strands were huge, 165 to 189 nucleotides long, and far too complex to have plausibly popped into existence in a primordial soup. And crucially, none of them could copy *themselves*. They could copy other, simpler RNAs, but their own folded structures blocked self-replication. It was a fundamental paradox: a ribozyme needs to fold to work, but when folded, it can't be copied.

Researchers at the MRC Laboratory of Molecular Biology in Cambridge (the same lab where Watson and Crick figured out DNA's structure) appear to have cracked it. They discovered QT45: a 45-nucleotide ribozyme, less than a quarter the size of previous RNA polymerases, that can synthesize both its complementary strand *and* a copy of itself. It does this by stitching together three-letter RNA building blocks (trinucleotides) rather than adding one letter at a time. Those triplets bind strongly enough to unravel folded RNA structures, solving the self-replication paradox that has stumped the field for decades.

The "45" matters enormously. Previous self-replicating ribozyme candidates were so large and complex that their spontaneous emergence on early Earth seemed implausible, like lightning striking a junkyard and assembling a 747. At 45 nucleotides, QT45 is small enough that the researchers argue polymerase ribozymes may be far more abundant in random RNA sequence space than anyone thought, meaning self-replication might not have required an astronomically unlikely accident. It might have been, in a sense, easy.

The coolest part is that the triplet building blocks QT45 uses, three-letter RNA chunks, are the same triplet code that all life on Earth still uses today to make proteins like the ones that AlphaFold discovered the structure of and IsoDDE targets. The genetic code is like a still-operational fossil of the very first replication system.

We spend a lot of time in the Dose on people solving hard problems. This one is the hardest problem: how did something come from nothing? How did chemistry become biology? The answer, it turns out, might be astonishingly simple, just 45 letters long. Way shorter than anything I’ve written.

**(5) [Texas Parents Rush for School Choice](https://www.wsj.com/opinion/texas-esa-applications-42000-kelly-hancock-greg-abbott-school-choice-e3de4bce?mod=e2two)**

*The Wall Street Journal Editorial Board*

There was a viral slop essay on X this week that I won’t link to but that you’ve probably seen talking about how screwed humans are, including our kids, except for maybe those of us who pay to get the good models and the analysts who ask AI to do research that would have taken three days in one hour. I, for one, think the kids are going to be alright, especially the ones who learn how to think instead of asking the machines to do it for them.

One thing is clear, though: we’re going to need to educate our kids in a way that’s different from the Prussian Model, which uncharitably optimized us to think like machines so that we would be good factory workers. We need to teach our kids to love learning, to ask questions, and to be curious. Basically, we need to teach our kids in a way that’s the opposite of the way most schools do it now.

That’s why I’ve been a big fan of school choice: states giving parents the money to choose better schools for their kids. School choice is not without its critics, who argue that it takes money away from public schools and hurts public school students, but public schools have had a monopoly on the education of the vast majority of kids who can’t afford private school, and the results have largely been what you’d expect from a state-protected monopoly. School choice encourages competition and can help direct funds to new schools taking new approaches to rethinking education.

This week was a big one for school choice. Texas opened applications for its new Education Freedom Accounts on February 4th, and 42,000 families applied on day one, a nationwide record for any new school choice program, surpassing Tennessee's 33,000 first-day applications last year. By the next morning, the number had crossed 47,000. The latest reports are at 91,000. The application window runs through March 17th.

This was a long time coming. For more than 20 years, Texas's Republican-controlled House blocked school choice legislation, even as the Senate passed ESA bills session after session. The tide turned in 2024 when Governor Abbott campaigned for 16 House candidates who challenged the incumbents blocking his school choice bill. The new House Speaker, Dustin Burrows, pledged the bill would pass. It did, last April. Senate Bill 2 allocated $1 billion for the 2026-27 school year, with room to grow to $4.5 billion by 2030.

The program gives eligible families roughly $10,474 per student per year to use toward private school tuition, homeschooling costs, tutoring, career and technical education, and other approved educational expenses. Students with disabilities can receive up to $30,000. Eligibility is prioritized by economic need, not first-come-first-served, with disabled and low-income students at the top.

I’m personally excited about this one because the Certified Educational Assistance Organization running the day-to-day operations of the program (application portal, payment processing, e-commerce marketplace where families shop for approved educational services) is [Odyssey](https://www.withodyssey.com/en), a not boring capital portfolio company. Odyssey already manages ESA programs in Iowa, Georgia, Louisiana, Utah, and Wyoming, but Texas is a different animal. This is the biggest state school choice program ever launched, and Odyssey is the infrastructure making it work, providing each family with a secure digital wallet, real-time balances, and access to a marketplace of vetted schools and providers. They’ve handled the biggest launch ever seamlessly.

The numbers show that parents want this. I’m excited to see how K-12 education evolves as parents get to choose where to allocate dollars to get the education they think is best for their kids.

**EXTRA DOSE: Will Manidis, Anthropic, Simile, 3D printed boats, Zero**