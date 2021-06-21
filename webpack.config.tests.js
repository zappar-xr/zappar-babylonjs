/* eslint-disable no-restricted-syntax */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { getTemplates, generateStandalone } = require("./webpack.helper");
const baseConfig = require("./webpack.config.base");

//* To add an extra test this script does not need to be modified.*
//* Please read CONTRIBUTING.MD *

const entries = {};
baseConfig.plugins = [];
baseConfig.plugins.push(
  new ESLintPlugin({
    fix: true,
    extensions: ["ts", "tsx"],
    exclude: ["node_modules", "tests"],
  })
);

generateStandalone();

const getPlugin = (testType, template, chunk) =>
  new HtmlWebpackPlugin({
    template: `./tests/html-templates/${template.template_id}.html`,
    filename: `./pages/${testType}/${template.pageName}.html`,
    favicon: "./tests/assets/favicon.png",
    title: "Zappar UAR BabylonJS",
    chunks: [chunk],
  });

const setupHtmlWebpackPlugin = (opts) => {
  for (const template of getTemplates(opts)) {
    const chunk = `${opts.templateType}-${template.pageName}`;
    entries[chunk] = `./tests/${opts.templateType}/${template.fullFileName}`;
    const plugin = getPlugin(opts.templateType, template, chunk);
    baseConfig.plugins.push(plugin);
  }
};

baseConfig.plugins.push(
  new CopyPlugin({
    patterns: [{ from: "./umd", to: "./standalone/" }],
  })
);

// *Setup Manual and Jest Tests*
const builds = [
  {
    templateType: "jest/module",
    extension: ".ts",
  },
  {
    templateType: "manual",
    extension: ".ts",
  },
  {
    templateType: "jest/generated-standalone",
    extension: ".js",
  },
];

builds.forEach(setupHtmlWebpackPlugin);

baseConfig.entry = entries;

baseConfig.output = {
  filename: "js/[name].js",
  path: `${__dirname}test-dist`,
};

baseConfig.devtool = "eval-cheap-source-map";

baseConfig.devServer = {
  contentBase: "./test-dist",
  https: true,
  host: "0.0.0.0",
  hot: true,
  port: 8081,
};

baseConfig.output.path = path.resolve(__dirname, "test-dist");

module.exports = baseConfig;
