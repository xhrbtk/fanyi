#!/usr/bin/env node
const { Command } = require('commander')
import { translate } from './main'
const program = new Command()

program
    .version('0.0.1')
    .name('fy')
    .usage('<english>')
    .arguments('<English>')
    .action(function(english: string) {
        translate(english)
    })

program.parse(process.argv)
