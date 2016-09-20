# Lexical Diff
Lexical diff is a new kind of diff that compares lexer tokens instead of text. This has a lot of advantages over text diffs. This project is a proof-of-concept that will hopefully open the software development world's mind to the idea and the consequences.

## Our New Lexical World
The rest of this document assumes that we've moved into a new lexical paradigm, where all of our favorite tools have been updated to work lexically. This meant git stores source code in lexer token lists, not text files. Your text editor will open the token list and display source code to you, then converts the file back to a token list when it saves the file.

## This Code Is... Suboptimal
This repo is written in JavaScript with Node and tokenizes PHP files. It probably doesn't parse the HTML correctly. The algorithm it uses to diff is pretty slow and it doesn't produce very good diffs. That's not the point. This is a proof of concept meant only to illustrate what's happening.

## What's the Actual Difference Between These HTML Documents?
```html
<html><head><title>page title</title></head><body></body></html>
```

```html
<html>
    <head>
        <title>different title</title>
    </head>
    <body></body>
</html>
```
If you do a regular diff, you'll see that these files are completely different. If you do a lexical diff, you'll get a completely different story. **Only one html token has been changed: the title node inside the head tag.** This is all the browser cares about once it parses the HTML, and this is all you need to care about as well.

Let's take it to the next step. Your code editor is already smart enough to know how format html. All we need to do is teach it how to read the list of tokens and convert that into text, then it can format it and you don't need to know whether the underlying data structure is text or tokens.

Now the next step. Don't even store the text. That's for the squishy software developer. The computer only needs the tokens to do its job, not all of the extra stuff we humans use to make it readable. Teach git how to store tokens, and now git doesn't need the text either.

## Advantages

### 1. Say Goodbye to Coding Standards
A proper editor will take the token list and provide source code formatted according to the developer's wishes. One developer can edit the code with tabs, check it in, then another developer can check it out and open the file to see it has spaces. With any luck, our children will not even understand arguments over coding standards.

### 2. No need to ignore whitespace in diffs
Some whitespace is significant, such as in Python or HTML. Lots of whitespace is discarded by the compiler or interpreter. It makes no difference whether it's there or not. Why should we bother ourselves with text that the computer ignores? When you compare lexer tokens, you're only comparing what the computer cares about.

### 3. Compilers / Interpreters Can Skip the Lexer Step
This is probably a pretty small advantage.

## Disadvantages

### 1. We Need All of the Tooling
As of now, git stores text and code editors edit text. All of the editors will have to be rewritten to read a stream of lexer tokens. It will only need to be written once per language, so hopefully this won't be a big deal. The tooling part is a major goal of this project.
