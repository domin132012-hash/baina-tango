export const DICTIONARY_SOURCE = {
  source: "JMdict",
  sourceVersion: "sample-fixture-2026-06-17",
  license: "CC BY-SA 4.0",
  attribution: "JMdict / EDRDG",
  attributionText: "Dictionary data: JMdict / EDRDG, CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
};

export const SAMPLE_ENTRIES = [
  {
    id: "jmdict-sample-001",
    headword: "努力",
    readings: ["どりょく"],
    forms: ["努力", "どりょく"],
    partOfSpeech: ["noun", "suru verb"],
    isCommon: true,
    senses: [
      {
        englishGloss: ["effort", "exertion", "endeavour"],
        chineseGloss: null,
        senseOrder: 1
      }
    ]
  },
  {
    id: "jmdict-sample-002",
    headword: "食べる",
    readings: ["たべる"],
    forms: ["食べる", "たべる"],
    partOfSpeech: ["Ichidan verb", "transitive verb"],
    isCommon: true,
    senses: [
      {
        englishGloss: ["to eat"],
        chineseGloss: null,
        senseOrder: 1
      },
      {
        englishGloss: ["to live on", "to make a living"],
        chineseGloss: null,
        senseOrder: 2
      }
    ]
  },
  {
    id: "jmdict-sample-003",
    headword: "読む",
    readings: ["よむ"],
    forms: ["読む", "よむ"],
    partOfSpeech: ["Godan verb with mu ending", "transitive verb"],
    isCommon: true,
    senses: [
      {
        englishGloss: ["to read"],
        chineseGloss: null,
        senseOrder: 1
      },
      {
        englishGloss: ["to count", "to guess", "to predict"],
        chineseGloss: null,
        senseOrder: 2
      }
    ]
  },
  {
    id: "jmdict-sample-004",
    headword: "高い",
    readings: ["たかい"],
    forms: ["高い", "たかい"],
    partOfSpeech: ["i-adjective"],
    isCommon: true,
    senses: [
      {
        englishGloss: ["high", "tall"],
        chineseGloss: null,
        senseOrder: 1
      },
      {
        englishGloss: ["expensive"],
        chineseGloss: null,
        senseOrder: 2
      },
      {
        englishGloss: ["high-pitched", "loud"],
        chineseGloss: null,
        senseOrder: 3
      },
      {
        englishGloss: ["proud"],
        chineseGloss: null,
        senseOrder: 4
      }
    ]
  }
];
