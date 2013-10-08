% Random Choice
% Bob Ippolito
% October 2013

# Why this talk?

* I wrote an ad server in Erlang
* Randomized algorithms are useful for ad serving
* They have other fun applications too

# Erlang's `random` module

* Wichmann-Hill AS183 algorithm from 1982
* … designed for 16 bit computers with limited arithmetic
* It has poor results and you probably shouldn't use it
* Consider the `crypto` module
* … or a third party library ([sfmt-erlang](https://github.com/jj1bdx/sfmt-erlang))
* Despite this, I will use `random` for the examples

# Fair coin {#fair-coin-code}

* `uniform()`{.erlang} returns a float
* `0.0 ≤ X < 1.0`{.erlang}
* heads when `X < 0.5`{.erlang}
* tails otherwise

# Fair coin {#fair-coin}

<svg viewBox="0 0 1200 500" height="50%" preserveAspectRatio="xMidYMid" class="full diagram">
  <g class="number-line" transform="translate(600,425)" >
      <line x1="-490" x2="-490" y1="-25" y2="25" />
      <line x1="490" x2="490" y1="-25" y2="25" />
      <line y1="-10" y2="10" />
      <line x1="-490" x2="490" />
      <text x="-490" y="25">0.0</text>
      <text y="25">0.5</text>
      <text x="490" y="25">1.0</text>
    </g>
    <g class="coins" transform="translate(600,0)" >
    </g>
    <g class="heads box" transform="translate(55,0)">
      <text y="25" class="num-heads">0</text>
      <text y="425">Heads</text>
    </g>
    <g class="tails box" transform="translate(1145,0)">
      <text y="25" class="num-tails">0</text>
      <text y="425">Tails</text>
    </g>
</svg>
<div class="demo">
  <button>Flip Coin</button>
  <h3 class="nomargin">X = <span class="x">…</span></h3>
  <p class="heads big">○ (heads), X &lt; 0.5</p>
  <p class="tails big">● (tails), X ≥ 0.5</p>
</div>

# Die roll {#die-roll-code}

* `uniform(N)`{.erlang} returns an integer `1 ≤ X ≤ N`{.erlang}
* Also easy to implement with `uniform()`{.erlang}

<div class="bigger">
```erlang
uniform(N) ->
    1 + trunc(N * uniform()).
```
</div>

# Die roll {#die-roll}

<svg viewBox="0 0 1200 500" height="50%" preserveAspectRatio="xMidYMid" class="full diagram">
  <g class="number-line" transform="translate(600,425)" >
    <line x1="-510" x2="510" y1="0" y2="0" />
    <line x1="-510" x2="-510" y1="-80" y2="0" />
    <line x1="-340" x2="-340" y1="-80" y2="0" />
    <line x1="-170" x2="-170" y1="-80" y2="0" />
    <line x1="0" x2="0" y1="-80" y2="0" />
    <line x1="170" x2="170" y1="-80" y2="0" />
    <line x1="340" x2="340" y1="-80" y2="0" />
    <line x1="510" x2="510" y1="-80" y2="0" />
    <text x="-425" y="10">1</text>
    <text x="-255" y="10">2</text>
    <text x="-85" y="10">3</text>
    <text x="85" y="10">4</text>
    <text x="255" y="10">5</text>
    <text x="425" y="10">6</text>
    <text x="-425" y="-400" class="num-1">0</text>
    <text x="-255" y="-400" class="num-2">0</text>
    <text x="-85" y="-400" class="num-3">0</text>
    <text x="85" y="-400" class="num-4">0</text>
    <text x="255" y="-400" class="num-5">0</text>
    <text x="425" y="-400" class="num-6">0</text>
  </g>
  <g class="dice" transform="translate(600,0)">
  </g>
</svg>
<div class="demo">
  <button>Roll Die</button>
  <h3 class="nomargin">X = <span class="x">…</span></h3>
  <span class="die big"></span>
</div>

# Random selection without replacement {#unweighted-selection-notes}

* Choice removed from future selections
* Shuffle a list (very slowly)
* Simulate a deck of cards
* Choose a name from a hat

# Random selection without replacement {#unweighted-selection-code}

<div class="bigger">
```erlang
choose(L) ->
  Nth = random:uniform(length(L)) - 1,
  {H, [Choice | T]} = lists:split(Nth, L),
  {Choice, H ++ T}.
```
</div>

# Random selection without replacement {#unweighted-selection}

<svg viewBox="0 0 1200 500" height="50%" preserveAspectRatio="xMidYMid" class="full diagram">
  <g transform="translate(100, 100)" class="selections">
    <text x="0" y="0" data-pos="0" class="ready">⁂</text>
    <text x="200" y="0" data-pos="1" class="ready">♖</text>
    <text x="400" y="0" data-pos="2" class="ready">♗</text>
    <text x="600" y="0" data-pos="3" class="ready">☺</text>
    <text x="800" y="0" data-pos="4" class="ready">✈</text>
    <text x="1000" y="0" data-pos="5" class="ready">☭</text>
  </g>
</svg>
<div class="demo">
  <button>Select</button>
</div>

# Weighted selection without replacement {#weighted-selection-notes}

* Weights are not always uniform
* Unfair dice, ad selection, sporting events…

# Weighted selection without replacement {#weighted-selection}

<div class="bigger">
```erlang
%% {sum(Weight), [{Key, Weight}, …]}
wselect(N, {Sum, Pairs}) when N =< Sum ->
  wselect(N, {Sum, Pairs}, []).

wselect(N, L, {S, [H={K, W} | T]}, Acc) ->
  case N - W of
    N1 when N1 > 0 ->
      wselect(N1, T, [H | Acc]);
    _ ->
      {K, {S - W, lists:reverse(Acc, T)}}
  end.
```
</div>

# Random selection with replacement {#unweighted-selection-repl-notes}

* Does not change list
* Similar to rolling a die

<div class="bigger">
```erlang
choose(L) ->
  Nth = random:uniform(length(L)) - 1,
  lists:nth(Nth, L).
```
</div>

# Random selection with replacement {#unweighted-selection-repl}

<svg viewBox="0 0 1200 500" height="70%" preserveAspectRatio="xMidYMid" class="full diagram">
  <g transform="translate(100, 100)" class="selections">
    <text x="0" y="0" data-pos="0" class="ready">⁂</text>
    <text x="200" y="0" data-pos="1" class="ready">♖</text>
    <text x="400" y="0" data-pos="2" class="ready">♗</text>
    <text x="600" y="0" data-pos="3" class="ready">☺</text>
    <text x="800" y="0" data-pos="4" class="ready">✈</text>
    <text x="1000" y="0" data-pos="5" class="ready">☭</text>
  </g>
</svg>
<div class="demo selection-with-repl">
  <button>Select</button>
</div>

# Weighted selection, naive {#weighted-selection-repl-1}

* With replacement, weight can be implemented simply
* Just add the item to the list multiple times
* `[a, a, a, b, c, d]`
* 50% `a`, ~16.6% `b`, …

# Weighted selection with replacement {#weighted-selection-repl-naive}

<svg viewBox="0 0 1200 500" height="70%" preserveAspectRatio="xMidYMid" class="full diagram">
  <g transform="translate(100, 100)" class="selections">
    <text x="0" y="0" data-pos="0" class="ready">⁂</text>
    <text x="200" y="0" data-pos="1" class="ready">⁂</text>
    <text x="400" y="0" data-pos="2" class="ready">⁂</text>
    <text x="600" y="0" data-pos="3" class="ready">☺</text>
    <text x="800" y="0" data-pos="4" class="ready">✈</text>
    <text x="1000" y="0" data-pos="5" class="ready">☭</text>
  </g>
</svg>
<div class="demo selection-with-repl">
  <button>Select</button>
</div>

# Optimizing for memory {#weighted-selection-repl-2-notes}

* Naive solution uses a lot of memory
* Can do better by counting each unique choice
* Tradeoff - it's harder to seek to Nth choice

<div class="bigger">
```erlang
{6, [ {a, 3}
    , {b, 1}
    , {c, 1}
    , {d, 1} ]}
```
</div>


# Alias method {#alias-notes}

* Create N coins, one for each unique choice
* Choose coin (by die roll), then flip weighted coin
* Uses O(N) memory, has O(1) selection!

# Alias method {#alias}
<div class="demo">
<div style="float: left">
  <button>Choose</button>
  <h3>Die: <span class="die"></span></h3>
  <h3>Coin: <span class="coin"></span></h3>
</div>
<table style="float: right">
  <thead>
    <tr><th>head</th><th>tail</th></tr>
    </thead>
  <tbody>
    <tr><td><tt>a</tt> 1</td><td><tt>undefined</tt></td></tr>
    <tr><td><tt>b</tt> ⅔</td><td><tt>a</tt> ⅓</td></tr>
    <tr><td><tt>c</tt> ⅔</td><td><tt>a</tt> ⅓</td></tr>
    <tr><td><tt>d</tt> ⅔</td><td><tt>a</tt> ⅓</td></tr>
  </tbody>
</table>
</div>

# Handling updates

* For our IRC bot, the choices update for every word of text
* Alias method is `O(n)` to update
* High `O(n)` garbage, no sharing at all

# Using a tree {#naive-tree-update}

* Can build a tree for efficient updates
* Fast `O(log n)` updates
* Low `O(log n)` garbage, good sharing
* Slow `O(n)` seeks, since sort is by key

# Simple max heap {#max-heap-notes}

* Seems to be a good compromise between speed and memory
* Highest weights first
* Highest weights are most likely to be updated
* Worst case `O(n)` for every operation
* But very good common case, near head of the list

# Simple max heap {#max-heap}
<div class="demo">
<div style="float: left">
  <button>Choose</button>
  <form>
  <input type="text" placeholder="Enter words" /><br />
  <span class="big output"></span>
  </form>
</div>
<table style="float: right">
  <thead>
    <tr><th>Key&nbsp;</th><th>Weight</th></tr>
    </thead>
  <tbody>
  </tbody>
</table>
</div>

# Andrey Andreyevich Markov
<!-- http://en.wikipedia.org/wiki/File:AAMarkov.jpg -->
![Андре́й Андре́евич Ма́рков](img/AAMarkov.jpg)

# Markov chain
<!-- http://en.wikipedia.org/wiki/File:Markovkate_01.svg -->
![Markov Chain](img/Markovkate_01.svg)

# Markov text generator

* Each step in a markov chain model makes a random choice
* For the IRC bot, the number of word choices can be very large
* Previous implementation was very simple, but too inefficient
* Used too much memory, had to be retired years ago

# Really?

* (Most) ad servers also use random choice
* Mochi Media built this kind of ad server in Erlang
* Was fun to come up with an efficent way to do it
* Note that Markov models weren't used in our ad server
* … but random choice is common to both

# Questions? {#info}

+-------------+----------------------------------------------+
| **Slides**  | <http://bob.ippoli.to/random_choice_2013/>   |
+-------------+----------------------------------------------+
| **Source**  | [github.com/etrepum/random_choice_2013]      |
+-------------+----------------------------------------------+
| **Email**   | bob@redivi.com                               |
+-------------+----------------------------------------------+
| **Twitter** | @etrepum                                     |
+-------------+----------------------------------------------+

[github.com/etrepum/random_choice_2013]: https://github.com/etrepum/random_choice_2013
