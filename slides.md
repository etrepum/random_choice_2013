% Random Choice
% Bob Ippolito
% October 2013

# Why this talk?

* I was rewriting an IRC bot
* He "learns" how to chat
* Brain is based on Markov chains
* Random choice is essential to this and many other interesting applications

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

# Erlang's `random` module

* Wichmann-Hill AS183 algorithm from 1982
* … designed for 16 bit computers with limited arithmetic
* It has poor results and you probably shouldn't use it
* Consider the `crypto` module
* … or a third party library ([sfmt-erlang](https://github.com/jj1bdx/sfmt-erlang))
* Despite this, I will use `random` for the examples

# Fair coin {#fair-coin-code}

* `uniform()` returns a float `0.0 ≤ X &lt; 1.0`
* ○ (heads) when `X &lt; 0.5`
* ● (tails) otherwise

# Fair coin {#fair-coin}

<div class="demo">
  <button>Flip Coin</button>
  <h3 class="nomargin">X = <span class="x">…</span></h3>
  <p class="heads big">○ (heads), X &lt; 0.5</p>
  <p class="tails big">● (tails), X ≥ 0.5</p>
</div>

# Die roll {#die-roll-code}

* `uniform(N)` returns an integer `1 ≤ X ≤ N`
* `uniform(N) -> 1 + trunc(N * uniform()).`

# Die roll {#die-roll}

<div class="demo">
  <button>Roll Die</button>
  <h3 class="nomargin">X = <span class="x">…</span></h3>
  <span class="die big"></span>
</div>

# Random selection without replacement {#unweighted-selection-code}

```erlang
choose(L) ->
  Nth = random:uniform(length(L)),
  {H, [Choice | T]} = lists:split(Nth, L),
  {Choice, H ++ T}.
```

# Random selection without replacement {#unweighted-selection-notes}

* Can be used to shuffle a list (very slowly)
* Or simulate a deck of cards
* Not used by our Markov model, but worthy of demonstration

# Random selection without replacement {#unweighted-selection}
<div class="demo">
  <button>Select</button>
  <h3 class="nomargin">Selections = </h3>
  <span class="selections big">&nbsp;</span>
  <h3 class="nomargin">L = </h3>
  <span class="l big">&nbsp;</span>
</div>

# Weighted selection without replacement {#weighted-selection}

* `{sum(Weight), [{Key, Weight}, …]}`
```erlang
weight_split(N, L) -> weight_split(N, L, []).
weight_split(N, L, [H={K, W} | T], Acc) ->
  case N - W of
    N1 when N1 > 0 ->
      weight_split(N1, T, [H | Acc]);
    _ ->
      {K, lists:reverse(Acc, T)}
  end.
```

# Random selection with replacement {#unweighted-selection-repl-notes}

```erlang
choose(L) ->
  lists:nth(random:uniform(length(L)), L).
```
* Does not change list
* Similar to rolling a die

# Random selection with replacement {#unweighted-selection-repl}
<div class="demo selection-with-repl" data-initial='["☃", "♖", "♗", "☺", "✈", "☭"]'>
  <button>Select</button>
  <h3 class="nomargin">Selections = </h3>
  <span class="selections big">&nbsp;</span>
  <h3 class="nomargin">L = </h3>
  <span class="l big">&nbsp;</span>
</div>

# Weighted selection, naive {#weighted-selection-repl-1}

* With replacement, weight can be implemented simply
* Just add the item to the list multiple times
* `[a, a, a, b, c, d]`
* 50% `a`, ~16.6% `b`, …

# Weighted selection with replacement {#weighted-selection-repl-1}

<div class="demo selection-with-repl" data-initial='["☃", "☃", "☃", "☺", "✈", "☭"]'>
  <button>Select</button>
  <h3 class="nomargin">Selections = </h3>
  <span class="selections big">&nbsp;</span>
  <h3 class="nomargin">L = </h3>
  <span class="l big">&nbsp;</span>
</div>

# Optimizing for memory {#weighted-selection-repl-2-notes}

* Naive solution uses a lot of memory
* Can do better by counting each unique choice
* `{6, [{a, 3}, {b, 1}, {c, 1}, {d, 1}]}`
* Tradeoff - it's harder to seek to Nth choice

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

Seems to be a good compromise between speed and memory
Highest weights first
Highest weights are most likely to be updated
Worst case `O(n)` for every operation
But very good common case, near head of the list

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

# Questions? {#info}

<h3>Slides:<br/>
&nbsp;&nbsp;<a href="http://bob.ippoli.to/rndchoice_efl_2012">etrepum.github.com/rndchoice_efl_2012</a></h3>
<h3>Code:<br/>
&nbsp;&nbsp;<a href="http://github.com/etrepum/rndchoice_efl_2012">github.com/etrepum/rndchoice_efl_2012</a></h3>
<h3>Twitter:<br/>
&nbsp;&nbsp;<a href="http://twitter.com/etrepum">@etrepum</a></h3>
