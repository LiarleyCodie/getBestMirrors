const mirrors = `
  http://ubuntu.mti.mt.gov.br/
http://ubuntu-archive.locaweb.com.br/ubuntu/
http://mirror.ufam.edu.br/ubuntu/
http://sft.if.usp.br/ubuntu/
http://mirror.ufscar.br/ubuntu/
https://mirror.uepg.br/ubuntu/
http://ubuntu.c3sl.ufpr.br/ubuntu/
http://mirror.unesp.br/ubuntu/
http://archive.ubuntu.com/ubuntu/
`

module.exports = mirrors.split('\n').map((str) => str.trim()).filter((str) => str !== '')
