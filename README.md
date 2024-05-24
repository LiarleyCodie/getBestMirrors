# Get Bests Mirrors
This "tool" consists only of a script written in JavaScript and executed in the node.

This script takes a list of mirrors for Ubuntu and just sorts and formats the mirrors with the best latency.

The mirrors are ordered based on those that have the shortest **average response time**.

At the end, a string containing the mirrors ordered based on the one with the best latency is returned.

To use it, you must have **NodeJS** installed in your distribution, then clone the repository and replace the contents of the `mirrors.js` variable with your mirrors.
> Your mirrors must be separated by line breaks.

Then just run the script with `node main.js`
