var php_parser = require('php-parser');
var html_parser = require('htmlparser2');

var fs = require('fs');

// languages
const PHP = 0;
const HTML = 1;

//var test_file = fs.readFileSync('baseloop.php', { encoding: 'utf8' });
var test_file = fs.readFileSync('tests/tiny.php', { encoding: 'utf8' });
var test_file2 = fs.readFileSync('tests/tiny2.php', { encoding: 'utf8' });

var tokens1 = lex(test_file);
print_tokens(tokens1);
console.log('---');
var tokens2 = lex(test_file2);
print_tokens(tokens2);

diff_tokens(tokens1, tokens2);

function obj_equals(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    if (aProps.length != bProps.length)
        return false;

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName])
            return false;
    }

    return true;
}

function diff_tokens(t1, t2) {
	var i1 = 0, i2 = 0;
	var side = 0;
	while (i1 < t1.length && i2 < t2.length) {
		if (obj_equals(t1[i1], t2[i2])) {
			//console.log('  equal: ' + i1 + ' to ' + i2)
			i1 += 1;
			i2 += 1;
			continue;
		}

		// find next node in t1 that appears in t2 - O(N2)
		var found_match = false;
		//console.log('  looking for match for ' + i1);
		for (var t2_token = i2 + 1; t2_token < t2.length; ++t2_token) {
			//console.log('  comparing ' + i1 + ' to ' + t2_token);
			if (obj_equals(t1[i1], t2[t2_token])) {
				found_match = true;
				//console.log('  found next match: ' + i1 + ' to ' + t2_token);
				console.log('insert ' + i2 + ' to ' + (t2_token - 1) + ' from right side');
				i1 += 1;
				i2 = t2_token + 1;
				break;
			}
		}
		if (found_match)
			continue;

		// didn't find match for i1, look for match for i2
		found_match = false;
		//console.log('  looking for match for right side ' + i2);
		for (var t1_token = i1 + 1; t1_token < t1.length; ++t1_token) {
			//console.log('  comparing ' + t1_token + ' to ' + i2);
			if (obj_equals(t1[t1_token], t2[i2])) {
				found_match = true;
				//console.log('  found next match: ' + t1_token + ' to ' + i2);
				console.log('delete ' + i1 + ' to ' + (t1_token - 1) + ' from left side');
				i1 = t1_token + 1;
				i2 += 1;
				break;
			}
		}
		if (found_match)
			continue;

		// no match for left side or right side
		console.log('insert ' + i2 + ' from right side');
		console.log('delete ' + i1 + ' from left side');
		i1 += 1;
		i2 += 1;
		continue;

		// if left side is done, insert remaining lines from right side
		if (i1 == t1.length && i2 < t2.length) {
			console.log('insert ' + i2 + ' to ' + t2.length + ' from right side');
			break;
		}

		// if right side is done, delete remaining lines from left side
		if (i2 > t2.length && i1 < t1.length) {
			console.log('delete ' + i1 + ' to ' + t1.length + ' from left side');
			break;
		}
	}
}

function print_tokens(tokens) {
	for (var t in tokens)
		console.log(t + ": " + tokenToString(tokens[t]));
}

function lex(php_file) {
	var tokens = [];

	var php_lexer = php_parser.create().lexer;
	var needs_yytext = [
		php_parser.tokens.names['T_INLINE_HTML'],
		php_parser.tokens.names['T_COMMENT'],
		php_parser.tokens.names['T_DOC_COMMENT'],
		php_parser.tokens.names['T_VARIABLE'],
		php_parser.tokens.names['T_ENCAPSED_AND_WHITESPACE'],
	];
	php_lexer.setInput(php_file);
	var token;
	while ((token = php_lexer.lex()) != php_lexer.EOF) {
		if (token == php_parser.tokens.names['T_WHITESPACE'])
			continue;

		if (token == php_parser.tokens.names['T_INLINE_HTML']) {
			debugLog('T_INLINE_HTML');
			lexHTML(tokens, php_lexer.yytext);
			continue;
		}

		if (php_parser.tokens.values[token] === undefined) {
			debugLog('token: ' + token)
			tokens.push({ lang: PHP, text: token });
			continue;
		}

		if (needs_yytext.indexOf(token) >= 0) {
			debugLog(php_parser.tokens.values[token] + ': ' + php_lexer.yytext);
			tokens.push({ lang: PHP, token, text: php_lexer.yytext });
			continue;
		}

		debugLog(php_parser.tokens.values[token]);
	}

	return tokens;
}

function lexHTML(tokens, text) {
	//debugLog(text);
	var parts = [];
	var parser = new html_parser.Parser({
		onerror: function(e) {
			debugLog('  error: ' + e);
		},
		ontext: function (t) {
			debugLog('  text: "' + onelineString(t) + '"');
			tokens.push({ lang: HTML, token: 'text', text: t });
		},
		onopentag: function (tag, attributes) {
			debugLog('  open tag: ' + tag);
			tokens.push({ lang: HTML, token: 'open_tag', text: tag });
			for (var i in attributes) {
				tokens.push({ lang: HTML, token: 'attribute', name: i, value: attributes[i] });
				debugLog('    ' + i + ': ' + attributes[i]);
			}
		},
		onclosetag: function (tag) {
			tokens.push({ lang: HTML, token: 'close_tag', text: tag });
			debugLog('  close tag: ' + tag);
		},
		oncomment: function (comment) {
			tokens.push({ lang: HTML, token: 'comment', text: comment });
			debugLog('  comment: ' + onelineString(comment));
		},
	});
	parser.write(text);
	parser.end();
}

function onelineString(str) {
	var a = str.replace(/\n/g, "\\n");
	var b = a.replace(/\t/g, "\\t");
	return b;
}

function debugLog(str) {
	const debug = false;
	if (debug)
		console.log(str);
}

function tokenToString(token) {
	var s = '';
	switch (token.lang) {
		case PHP:
			s += 'PHP';
			if (token.token)
				s += ' ' + php_parser.tokens.values[token.token];
			if (token.text)
				s += ' ' + onelineString(token.text);
			return s;
		case HTML:
			s += 'HTML ' + token.token;
			if (token.text)
				s += ' ' + onelineString(token.text);
			return s;
	}
}