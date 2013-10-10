window.addEventListener('DOMContentLoaded', function () {
  var Reveal = window.Reveal,
      d3 = window.d3,
      EWD = window.EWD;
  function finishEvent() {
    d3.event.stopPropagation();
    d3.event.preventDefault();
    d3.event.target.blur();
    document.getSelection().removeAllRanges();
  }
  d3.selectAll("#fair-coin .demo").on('click', function () {
    var n = Math.random();
    var elem = d3.select(this);
    var heads = n < 0.5;
    var attr = heads ? 'heads' : 'tails';
    elem.selectAll('span.x').text(n.toFixed(4));
    elem.classed('heads', heads).classed('tails', !heads);
    var svg = d3.selectAll('#fair-coin svg');
    var coins = svg.selectAll('.coins');
    var d = coins.datum() || {heads: 0, tails: 0};
    d[attr] += 1;
    coins.datum(d);
    var flips = d.heads + d.tails;
    svg.selectAll('.num-' + attr).text(d[attr]);
    coins.insert('circle')
      .attr('r', '20')
      .attr('cx', (n - 0.5) * 980)
      .attr('cy', -100)
      .classed('heads', heads)
      .classed('tails', !heads)
      .transition()
      .attr('cy', 390 - flips);

    finishEvent();
  });
  d3.selectAll("#die-roll .demo").on('click', function () {
    var n = 1 + Math.floor(Math.random() * 6);
    var elem = d3.select(this);
    var die = ['⚀','⚁','⚂','⚃','⚄','⚅'][n - 1];
    elem.selectAll('span.x').text(n);
    elem.selectAll('span.die').text(die);
    var svg = d3.selectAll('#die-roll svg');
    var dice = svg.selectAll('.dice');
    var d = dice.datum() || {};
    d[n] = 1 + (0 | d[n]);
    dice.datum(d);
    var rolls = d[n] - 1;
    var col = rolls % 3;
    var row = Math.floor(rolls / 3);
    svg.selectAll('.num-' + n).text(d[n]);
    dice.insert('text')
      .text(die)
      .attr('y', -100)
      .transition()
      .attr('x', (n - 3.5) * 170 + (col - 1) * 50)
      .attr('y', 400 - row * 50);
    finishEvent();
  });
  d3.selectAll("#unweighted-selection .demo").on('click', function () {
    var sels = d3.selectAll('#unweighted-selection svg .selections');
    var choices = sels.selectAll('.ready');
    var chosens = sels.selectAll('.chosen');
    if (choices.empty()) {
      chosens
        .classed('ready', true)
        .classed('chosen', false)
        .transition()
        .attr('y', 0);
      return;
    }
    var n = Math.floor(Math.random() * choices.size());
    choices.each(function () {
      var i = 0 | this.dataset.pos;
      if (i > n) {
        this.dataset.pos -= 1;
        d3.select(this).transition().attr('x', 200 * (i - 1));
      } else if (i === n) {
        var pos = chosens.size();
        this.dataset.pos = pos;
        d3.select(this)
          .classed('ready', false)
          .classed('chosen', true)
          .transition()
          .attr('x', 200 * pos)
          .attr('y', 250);
      }
    });
    finishEvent();
  });
  d3.selectAll("#unweighted-selection-repl .demo," +
               "#weighted-selection-repl-naive .demo").on('click', function () {
    var sels = d3.select(this.parentNode).selectAll('svg .selections');
    var choices = sels.selectAll('.ready');
    var n = Math.floor(Math.random() * choices.size());
    var el = null;
    choices.each(function (d, i) {
      if (i === n) {
        el = d3.select(this);
      }
    });
    var c = (0|el.datum());
    el.datum(1 + c);
    var y0 = (0|el.attr('y'));
    var x0 = (0|el.attr('x'));
    var t0 = 'translate(' + x0 + ',' + y0 + ')';
    var t1 = 'translate(' + (x0 - 50 + 10 * c) + ',' + (100 + y0 + 10 * c) + ')';
    sels
      .insert('text')
      .text(el.text())
      .attr('transform', t0 + ' scale(1,1)')
      .attr('y', 0)
      .classed('chosen', true)
      .transition()
      .attr('transform', t1 + ' scale(0.5,0.5)')
      .attr('y', 250);
    finishEvent();
  });
  d3.selectAll("#alias div.demo").on('click', function () {
    var elem = d3.select(this);
    elem.selectAll('.selected').classed('selected', false);
    var $rows = elem.selectAll('tbody tr');
    var die = 1 + Math.floor(Math.random() * $rows.size());
    var coin = Math.random();
    elem.selectAll("span.die").text(die);
    elem.selectAll("span.coin").text(coin);
    var $die = elem.selectAll('tbody tr:nth-of-type(' + die + ')');
    $die.classed('selected', true);
    if (die == 1 || coin < 2.0/3.0) {
      $die.selectAll('td:nth-of-type(1)').classed('selected', true);
    } else {
      $die.selectAll('td:nth-of-type(2)').classed('selected', true);
    }
    finishEvent();
  });

  function SortedList() {
    this.list = [];
    this.total = 0;
  }
  SortedList.prototype.inc = function (key) {
    var count = 1;
    this.total++;
    var sortedList = this.list;
    // get current count and remove
    for (var i = 0; i < sortedList.length; i++) {
      if (sortedList[i][0] === key) {
        count += sortedList[i][1];
        sortedList.splice(i, 1);
        break;
      }
    }
    // insert
    for (i = i - 1; i >= 0 && sortedList[i][1] <= count; i--) {
    }
    sortedList.splice(i + 1, 0, [key, count]);
    return count;
  };
  SortedList.prototype.choose = function () {
    var n1 = 1 + Math.floor(Math.random() * this.total);
    var sortedList = this.list;
    for (var idx = 0; idx < sortedList.length; idx++) {
      n1 -= sortedList[idx][1];
      if (n1 <= 0) break;
    }
    return idx;
  };
  (function () {
    var sortedList = new SortedList();
    var quotes = EWD.filter(function (s) { return s !== null; });
    var qIndex = 0;
    var repl = function (str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    };
    var fmtRow = function (elem) {
      return '<tr>' + fmtTds(elem) + '</tr>';
    };
    var fmtTds = function (elem) {
      return '<td>' + repl(elem[0]) + '</td><td class="num">' + elem[1] + '</td>';
    };
    var handleInput = function (word) {
      if (word) {
        sortedList.inc(word);
      }
    };
    var updateTable = function () {
      d3.selectAll("#sorted-list div.demo tbody").html(sortedList.list.slice(0,9).map(fmtRow).join(''));
      d3.select('#sorted-list tfoot .length').text(sortedList.list.length);
      d3.select('#sorted-list tfoot .sum').text(sortedList.total);
    };
    d3.selectAll('#sorted-list .output').on('click', function () { 
      d3.select(this).html('');
      finishEvent();
    });
    d3.selectAll('#sorted-list button.add-all').on('click', function () {
      quotes.slice(qIndex % quotes.length).map(function (q) {
        q.split(/\s+/).map(handleInput);
        d3.selectAll('#sorted-list .quote').html('');
      });
      updateTable();
      qIndex = 0;
      d3.selectAll('#sorted-list .quote').html('').insert('em').text('All ' + quotes.length + ' quotes loaded').style('opacity', 1).transition().delay(2000).style('opacity', 0);
      finishEvent();
    });
    d3.selectAll("#sorted-list button.add-input").on('click', function () {
      var q = quotes[qIndex % quotes.length];
      qIndex++;
      q.split(/\s+/).map(handleInput);
      updateTable();
      d3.selectAll('#sorted-list .quote').text(q);
      finishEvent();
    });
    d3.selectAll("#sorted-list button.choose").on('click', function () {
      updateTable();
      var idx = sortedList.choose();
      var $tbody = d3.selectAll("#sorted-list div.demo table tbody");
      $tbody.selectAll('.selected').classed('selected', false);
      d3.selectAll('#sorted-list .output').insert('span').text(' ' + sortedList.list[idx][0]);
      var rows = $tbody.selectAll('tr');
      if (rows.size() < idx) {
        rows.classed('selected', true);
        $tbody.insert('tr')
          .classed('inserted', true)
          .html('<td colspan="2"><hr/></td>');
        $tbody.insert('tr')
          .html(fmtTds(sortedList.list[idx]))
          .classed('inserted', true)
          .classed('selected', true)
          .selectAll('td').classed('selected', true);
      } else {
        rows.each(function (d, i) {
          if (i > idx) return;
          var row = d3.select(this).classed('selected', true);
          if (i === idx) {
            row.selectAll('td').classed('selected', true);
          }
        });
      }
      finishEvent();
    });
  })();
  (function () {
    var stateSpace = {};
    var END = 'END';
    window._stateSpace = stateSpace;
    var quotes = EWD.filter(function (s) { return s !== null; });
    var qIndex = 0;
    var slide = d3.selectAll('#markov-text-generator');
    var getState = function (w) {
      var sl = stateSpace[w];
      if (sl === undefined) {
        sl = stateSpace[w] = new SortedList();
      }
      return sl;
    };
    var addQuote = function (q) {
      q.split(/\s+/).reduce(
        function (sl, w) {
          if (!w) return sl;
          sl.inc(w);
          return getState(w);
        },
        getState('')).inc(END);
    };
    slide.selectAll('button.generate').on('click', function () {
      var sl = getState('');
      var words = [];
      for (var i = 0; i < 100; i++) {
        var idx = sl.choose();
        var w = sl.list[idx][0];
        if (w === END) break;
        words.push(w);
        sl = getState(w);
      }
      slide.selectAll('.output').text(words.join(' '));
      finishEvent();
    });
    slide.selectAll('button.add-input').on('click', function () {
      var q = quotes[qIndex % quotes.length];
      qIndex++;
      addQuote(q);
      slide.selectAll('.quote').text(q);
      finishEvent();
    });
    slide.selectAll('button.add-all').on('click', function () {
      quotes.slice(qIndex % quotes.length).map(addQuote);
      qIndex = 0;
      slide.selectAll('.quote').html('').insert('em').text('All ' + quotes.length + ' quotes loaded').style('opacity', 1).transition().delay(2000).style('opacity', 0);
      finishEvent();
    });
  })();
});
