window.addEventListener('DOMContentLoaded', function () {
  var Reveal = window.Reveal,
      d3 = window.d3;
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
    var elem = d3.select(this);
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
  d3.selectAll("div.demo.selection-with-repl").on('click', function () {
    var elem = d3.select(this);
    var $l = elem.selectAll('span.l');
    var $s = elem.selectAll('span.selections');
    var lst = $l.datum();
    var sel = $s.datum();
    if (lst === undefined || !lst.length || sel.length > 9) {
      lst = JSON.parse(this.dataset.initial);
      sel = [];
    } else {
      var n = Math.floor(Math.random() * lst.length);
      sel.push(lst[n]);
    }
    $l.datum(lst).text('[' + lst.join(', ') + ']');
    $s.datum(sel).text('[' + sel.join(', ') + ']');
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

  (function () {
    var heap = [];
    var total = 0;
    var handleInput = function (word) {
      var count = 1;
      total += 1;
      for (var i = 0; i < heap.length; i++) {
        if (heap[i][0] === word) {
          count += heap[i][1];
          heap.splice(i, 1);
          break;
        }
      }
      for (i = i - 1; i >= 0 && heap[i][1] <= count; i--) {
      }
      heap.splice(i + 1, 0, [word, count]);
      var repl = function (str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
      };
      var fmt = function (elem) {
        return '<tr><td>' + repl(elem[0]) + '</td><td>' + elem[1] + '</td></tr>';
      };
      d3.selectAll("#max-heap div.demo tbody").html(heap.map(fmt).join(''));
    };
    d3.selectAll("#max-heap div.demo form").on('submit', function () {
      var $input = d3.select(this).selectAll('input');
      $input.property('value').split(/\s+/).forEach(handleInput);
      $input.property('value', '');
      finishEvent();
    });
    d3.selectAll("#max-heap div.demo button").on('click', function () {
      var n = 1 + Math.floor(Math.random() * total);
      var $tbody = d3.selectAll("#max-heap div.demo table tbody");
      $tbody.selectAll('.selected').classed('selected', false);
      var n1 = n;
      $tbody.selectAll('tr').each(function (d, i) {
        if (n1 > 0) {
          var $row = d3.select(this);
          $row.classed('selected', true);
          n1 -= heap[i][1];
          if (n1 <= 0) {
            $row.selectAll('td').classed('selected', true);
          }
        }
      });
      finishEvent();
    });
  })();
});
