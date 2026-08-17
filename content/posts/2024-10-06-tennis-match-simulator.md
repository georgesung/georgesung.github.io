---
layout: post
title: "Tennis Match Simulator: Point Win vs. Match Win Probabilities and S-Curves"
date: 2024-10-06
categories: Tennis
---

# TLDR

I built a tennis match simulator to answer questions like "If I win just 53% of points, how likely am I to win the match?" (spoiler: 79% chance). Ran Monte-Carlo simulations and plotted S-curves to visualize this, plus analyzed the effects of different match rules like best of 5 sets, fast 4, etc.

The simulator is live on [georgesung.com/tennis-match-simulator](https://www.georgesung.com/tennis-match-simulator/).

Further discussions can be found on the [Talk Tennis forums](https://tt.tennis-warehouse.com/index.php?threads/tennis-match-score-simulator-points-won-matches-won.776279/) and [Reddit](https://www.reddit.com/r/10s/comments/1fxr7u9/tennis_match_win_simulator/).

# Intro
Ever wondered:
- What percentage of matches would I win if I "only" won 53% of the points?
- What percentage of points do I need to win to get just one game off a much better player?
- If I usually win/lose 10-5 when playing practice tiebreaks with my friend, what is my expected match score in a full match?

Tennis is my main hobby, and I've certainly wondered about this. So I decided to build a tennis match simulator to find out!

[georgesung.com/tennis-match-simulator](https://www.georgesung.com/tennis-match-simulator/)

<img src="/assets/img/tennis-match-simulator/demo.png" alt="app screenshot" style="width: 80%;" />

This is a simple client-side web app, and those curious can check out the code [here](https://github.com/georgesung/tennis-match-simulator).

# Results

Under standard tennis scoring rules (best of 3 sets, standard ad scoring, full 3rd set), a slight edge in point-win probability translates into a significantly larger edge in match-win probability:
- If a player has a 50% chance of winning any individual point, they have exactly a 50% chance of winning the match.
- If a player's point-win probability increases by just 3% to 53%, they have a **79%** match-win probability.

Here are some more results, based on 100,000 simulated matches for each row under standard rules:

| Win Probability per Point (%) | Match Win Probability (%) | Expected Games per Set (Player A - B) | Notes / Observations |
| :---: | :---: | :---: | :--- |
| **50** | 50 | 4.83 - 4.84 | Balanced match |
| **51** | 60 | 5.06 - 4.58 | |
| **52** | 70 | 5.26 - 4.31 | |
| **53** | 79 | 5.45 - 4.02 | |
| **54** | 86 | 5.59 - 3.75 | |
| **55** | 91 | 5.71 - 3.45 | |
| **60** | 100 (rounded) | 5.98 - 2.15 | ~6-2 expected set score |
| **67** | 100 | 6.00 - 0.97 | Equivalent to winning 10-5 in a tiebreak; ~6-1 expected set score |
| **72** | 100 | 6.00 - 0.50 | Opponent is expected to win only one game in the entire match |

This simulator allows us to change match settings by toggling different variables (such as best of 5 sets, no-ad scoring, match tiebreak to 10 points in lieu of the final set, and the Fast 4 format). Below is an overall overlay comparing how each of these scoring variations alters the S-curve behavior relative to the standard setup:

<img src="/assets/img/tennis-match-simulator/overall_comparison.png" alt="s-curves" style="width: 100%;" />

From this chart, we can observe interesting scoring effects:
- **Best of 5 sets (red dashed line)** makes the S-curve even steeper, further rewarding the player with the statistical point edge.
- **Fast 4 (yellow dashed line)**, **match tiebreak to 10 (purple dotted line)**, and **no-ad scoring (green dash-dot line)** reduce the number of points/games played, which introduces more variance and flattens the S-curve, giving the underdog a better chance.

Here is the raw data (based on 100,000 simulated matches per scenario) used to plot the S-curves above. First column is point-win probability, and the remaining columns to the right are match win probabilities under different scoring rules.

| Point Win Prob. | Standard | Best of 5 | No-Ad | Match Tiebreak | Fast 4 |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 40% | 0.41% | 0.05% | 0.91% | 1.31% | 1.71% |
| 41% | 0.81% | 0.15% | 1.72% | 2.28% | 2.74% |
| 42% | 1.67% | 0.37% | 2.93% | 3.75% | 4.43% |
| 43% | 3.08% | 0.92% | 4.90% | 5.85% | 6.76% |
| 44% | 5.41% | 2.25% | 7.82% | 9.12% | 10.01% |
| 45% | 8.98% | 4.65% | 11.88% | 13.13% | 14.28% |
| 46% | 13.96% | 8.85% | 17.19% | 18.48% | 19.68% |
| 47% | 21.09% | 15.62% | 23.89% | 25.04% | 26.31% |
| 48% | 29.36% | 25.15% | 31.67% | 32.66% | 33.37% |
| 49% | 39.47% | 36.83% | 40.53% | 41.11% | 41.56% |
| 50% | 49.93% | 49.96% | 50.00% | 49.98% | 50.11% |
| 51% | 60.56% | 63.25% | 59.46% | 58.85% | 58.32% |
| 52% | 70.62% | 75.14% | 68.22% | 67.41% | 66.55% |
| 53% | 79.13% | 84.51% | 76.26% | 74.99% | 73.94% |
| 54% | 85.90% | 90.91% | 82.99% | 81.64% | 80.15% |
| 55% | 90.94% | 95.37% | 88.28% | 86.86% | 85.75% |
| 56% | 94.53% | 97.76% | 92.21% | 91.02% | 89.94% |
| 57% | 96.91% | 99.01% | 95.08% | 94.07% | 93.29% |
| 58% | 98.42% | 99.62% | 97.05% | 96.22% | 95.55% |
| 59% | 99.10% | 99.86% | 98.30% | 97.79% | 97.16% |
| 60% | 99.64% | 99.96% | 99.04% | 98.62% | 98.36% |

# How the simulator works

The simulator is a client-side NextJS web app that runs in your browser. Rather than calculating complex exact probability formulas, we use a Monte-Carlo approach by simulating thousands of matches (default 100,000) and aggregating the outcomes.

Here is the hierarchical flow of how a match is simulated:

### 1. Simulating a point
To decide who wins a point, the simulator generates a random number between 0 and 1 using `Math.random()` and compares it to Player A's point-win probability:
* If the random number is less than Player A's probability, Player A wins the point.
* Else, Player B wins the point.
* *(Note: If the "Serve/return win %" setting is enabled, the simulator dynamically adjusts the target threshold depending on who is serving during that game).*

### 2. Simulating a game
A game is simulated by calling the point simulator in a loop:
* *Standard rules:* The first player to win at least 4 points with a lead of 2 or more wins the game.
* *No-ad scoring:* If the score reaches 3-3 (Deuce), the simulator plays a single deciding point to determine the winner of the game.

### 3. Simulating a set
A set is simulated by alternating serves and playing games:
* *Standard rules:* The first player to reach 6 games with a 2-game lead wins the set. If the score reaches 6-6, a 7-point tiebreak is played.
* *Fast 4 format:* The target is set to 4 games. If the score reaches 3-3, a 7-point tiebreak is played. The 2-game lead rule is ignored.

### 4. Simulating a match
A match is played until one player wins the required number of sets (2 sets for best-of-3, 3 sets for best-of-5):
* *Standard rules:* The server alternates sequentially. The simulator handles rule-compliant serve rotations (who serves first in the next set based on whether the total games of the previous set were odd or even).
* *Match tiebreak (10 points):* If the sets are tied (e.g., 1-1 in a best-of-3 match), a single 10-point tiebreak is played in lieu of a full final set to decide the match.

When you click "Simulate Matches," the simulator runs the above loop N times (default N=100,000 times), tracking the match winners, overall games won, and set scores to generate the final statistics.
