---
layout: post
title: "Tennis Match Simulator: Point Win vs. Match Win Probabilities and S-Curves"
date: 2024-10-06
categories: Tennis
---

# TLDR

I built tennis match simulator to answer questions like "if I win just 53% of points, how likely am I to win the match?" (spoiler: 79% chance). The simulator is live on [georgesung.com/tennis-match-simulator](https://www.georgesung.com/tennis-match-simulator/). Also plotted some S-curves to visualize this, plus looked at the effects of different match rules like best of 5 sets, fast 4, etc.

Further discussions can be found on the [Talk Tennis forums](https://tt.tennis-warehouse.com/index.php?threads/tennis-match-score-simulator-points-won-matches-won.776279/) and [Reddit](https://www.reddit.com/r/10s/comments/1fxr7u9/tennis_match_win_simulator/).

# Intro
Ever wondered:
- What percentage of matches would I win if I "only" won 53% of the points?
- What percentage of points do I need to win to get just one game off a much better player?
- If I usually win/lose 10-5 when playing practice tiebreaks with my friend, what is my expected match score in a full match?

I decided to build a tennis match simulator to find out!

[georgesung.com/tennis-match-simulator](https://www.georgesung.com/tennis-match-simulator/)

<img src="/assets/img/tennis-match-simulator/demo.png" alt="app screenshot" style="width: 80%;" />

This is a simple client side web app, and those curious can check out the code [here](https://github.com/georgesung/tennis-match-simulator).

# Point win probability vs. match win probability, and S-curves

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

Here is raw data used to plot the S-curves above:
(TODO: make this a nicer markdown format)
``csv
point_win_prob,default_match_win_prob,best_of_5_match_win_prob,no_ad_match_win_prob,match_tiebreak_match_win_prob,fast_four_match_win_prob,num_matches
0.40,0.0041,0.0005,0.0091,0.0131,0.0171,100000
0.41,0.0081,0.0015,0.0172,0.0228,0.0274,100000
0.42,0.0167,0.0037,0.0293,0.0375,0.0443,100000
0.43,0.0308,0.0092,0.0490,0.0585,0.0676,100000
0.44,0.0541,0.0225,0.0782,0.0912,0.1001,100000
0.45,0.0898,0.0465,0.1188,0.1313,0.1428,100000
0.46,0.1396,0.0885,0.1719,0.1848,0.1968,100000
0.47,0.2109,0.1562,0.2389,0.2504,0.2631,100000
0.48,0.2936,0.2515,0.3167,0.3266,0.3337,100000
0.49,0.3947,0.3683,0.4053,0.4111,0.4156,100000
0.50,0.4993,0.4996,0.5000,0.4998,0.5011,100000
0.51,0.6056,0.6325,0.5946,0.5885,0.5832,100000
0.52,0.7062,0.7514,0.6822,0.6741,0.6655,100000
0.53,0.7913,0.8451,0.7626,0.7499,0.7394,100000
0.54,0.8590,0.9091,0.8299,0.8164,0.8015,100000
0.55,0.9094,0.9537,0.8828,0.8686,0.8575,100000
0.56,0.9453,0.9776,0.9221,0.9102,0.8994,100000
0.57,0.9691,0.9901,0.9508,0.9407,0.9329,100000
0.58,0.9842,0.9962,0.9705,0.9622,0.9555,100000
0.59,0.9910,0.9986,0.9830,0.9779,0.9716,100000
0.60,0.9964,0.9996,0.9904,0.9862,0.9836,100000
```
