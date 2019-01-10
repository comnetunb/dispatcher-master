/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const fs = require('fs');

let configuration = {};

load();

module.exports.getConfiguration = () => {
  if (Object.keys(configuration).length === 0) {
    load();
  }

  return configuration;
};

function load() {
  try {
    configuration = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8').replace(/^\uFEFF/, ''));
  } catch (err) {
    // empty
  }

  treatDefaultValues();
}

function treatDefaultValues() {
  if (configuration.cpu === undefined) {
    configuration.cpu = {};
  }

  if (configuration.memory === undefined) {
    configuration.memory = {};
  }

  if (configuration.slavePerformance === undefined) {
    configuration.slavePerformance = {};
  }

  if (configuration.transporter === undefined) {
    configuration.transporter = {};
    configuration.transporter.auth = {};
  }

  // Prevent user's stupidity
  if (configuration.cpu.threshold === undefined || typeof configuration.cpu.threshold === 'string') {
    configuration.cpu.threshold = 0.5;
  } else if (configuration.cpu.threshold > 1) {
    configuration.cpu.threshold = 1;
  } else if (configuration.cpu.threshold < 0) {
    configuration.cpu.threshold = 0;
  }

  if (configuration.memory.threshold === undefined || typeof configuration.memory.threshold === 'string') {
    configuration.memory.threshold = 0.5;
  } else if (configuration.memory.threshold > 1) {
    configuration.memory.threshold = 1;
  } else if (configuration.memory.threshold < 0) {
    configuration.memory.threshold = 0;
  }

  if (configuration.slavePerformance.threshold === undefined || typeof configuration.slavePerformance.threshold === 'string') {
    configuration.slavePerformance.threshold = 0.25;
  } else if (configuration.slavePerformance.threshold > 1) {
    configuration.slavePerformance.threshold = 1;
  } else if (configuration.slavePerformance.threshold < 0) {
    configuration.slavePerformance.threshold = 0;
  }

  if (configuration.requestResourceInterval === undefined || typeof configuration.requestResourceInterval === 'string') {
    configuration.requestResourceInterval = 1;
  } else if (configuration.requestResourceInterval < 1) {
    configuration.requestResourceInterval = 1;
  }

  if (configuration.dispatchInterval === undefined || typeof configuration.dispatchInterval === 'string') {
    configuration.dispatchInterval = 3;
  } else if (configuration.dispatchInterval < 3) {
    configuration.dispatchInterval = 3;
  }
}
