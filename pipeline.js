const { generateEmailSubject } = require("./subjectLine");
const { generateEmailTheme } = require("./emailTheme");
const { generateEmailSections } = require("./emailSection");
const { generateTextComponent } = require("./componentText");
const { generateImageComponent } = require("./componentImage");
const { generateButtonComponent } = require("./componentButton");
const { generateColumnsComponent } = require("./componentColumns");
const { generateColumnsProperties } = require("./columnsProperties");
const { generateNestedColumnsProperties } = require("./nestedColumnProperties");
const { topic, description } = require("./emailConfig");
const { generateSpacerComponent } = require("./componentSpacer");
const { generateDividerComponent } = require("./componentDivider");

const nestedChildrenIds = new Set(); // Track all nested IDs

async function processChildComponent(emailTheme,  section, parentSection, childIndex) {

  let componentJson = {};
  if (section.type === "Text") {
     console.log("processChildComponentsection",section)

    componentJson = await generateTextComponent(emailTheme, {
      ...section,
      content: section.content,
    });
  } else if (section.type === "Image") {
    componentJson = await generateImageComponent(emailTheme,section);
  } else if (section.type === "Button") {
    componentJson = await generateButtonComponent(emailTheme, section,parentSection,childIndex);
  } else if (section.type === "Columns") {
    const nested = await processComponentTypes(emailTheme, [
      { componentTypes: ["Columns"], ...section },
    ]);
    Object.assign(componentJson, nested);
  }

  return componentJson;
}

async function processComponentTypes(emailTheme,emailSections) {
  const allComponents = {};

  for (const section of emailSections) {
    for (const innersection of section.content) {
      let componentJson;
      const type = innersection ?.componentType;
      innersection.id = section?.id
     

      if (type === "Text") {
        componentJson = await generateTextComponent(emailTheme,innersection);
        if (componentJson) Object.assign(allComponents, componentJson);
      } else if (type === "Image") {
        componentJson = await generateImageComponent(emailTheme,innersection);
        if (componentJson) Object.assign(allComponents, componentJson);
      } else if (type === "Button") {
        componentJson = await generateButtonComponent(emailTheme,innersection);
        if (componentJson) Object.assign(allComponents, componentJson);
      } else if (type === "Columns") {
        const columnsComponent = await generateColumnsComponent(innersection);
        const columnsWithProps = await generateColumnsProperties(
          emailTheme,
          columnsComponent
        );
              console.log("innersection",innersection)
              console.log("columnsWithProps",innersection)

        Object.assign(allComponents, columnsWithProps);

        const columnsId = Object.keys(columnsWithProps)[0];
        const columnIds = columnsWithProps[columnsId].data.childrenIds;
        const actualColumnIds = [];

        for (const colId of columnIds) {
          const columnComponent = await generateNestedColumnsProperties(colId);
                        console.log("columnComponent",columnComponent)
Object.assign(allComponents, columnComponent);

          const realColId = Object.keys(columnComponent)[0];
          actualColumnIds.push(realColId);
          nestedChildrenIds.add(realColId); // Track realColId to exclude from root

          const columnData = columnComponent[realColId];
          const columnChildren = columnData?.data?.childrenIds || [];
          const actualChildIds = [];
            for (const i in columnChildren) {
              const child = columnChildren[i];

              const childIndex = Number(i);

            if (typeof child === "object" && child.type) {
              console.log("childchild",child)
              console.log("innersection",innersection)
              const childObject = {...child, id:innersection.id}

              const generated = await processChildComponent(emailTheme, childObject,columnsWithProps[columnsId],childIndex);
              Object.assign(allComponents, generated);

              const generatedId = Object.keys(generated)[0];
              if(generatedId){
                actualChildIds.push(generatedId);
                nestedChildrenIds.add(generatedId);
              } 
            }
          }

          // Update column's childrenIds to actual component IDs
          columnData.data.childrenIds = actualChildIds;
          // columnData.data.childrenIds = actualChildIds.filter(Boolean);

        }

        // Update columns' childrenIds to actual column IDs
        columnsWithProps[columnsId].data.childrenIds = actualColumnIds;
        // nestedChildrenIds.add(columnsId); // Also mark the Columns component itself
      } else if (type === "Divider") {
         componentJson = await generateDividerComponent(emailTheme);
        if (componentJson) Object.assign(allComponents, componentJson);
      } else if (type === "Spacer") {
          componentJson = await generateSpacerComponent(emailTheme);
        if (componentJson) Object.assign(allComponents, componentJson);
      } else {
        console.warn(`Unknown Component Type: ${type}`);
      }
    }
  }

  return allComponents;
}

async function composeEmailLayout(theme, allComponents) {

  const childrenIds = Object.keys(allComponents).filter(
    (id) => !nestedChildrenIds.has(id)
  );

  const emailLayout = {
    root: {
      type: "EmailLayout",
      data: {
        style: {
          canvasColor: theme.backgroundColor,
          textColor: theme.textColor,
          fontFamily: theme.fontFamily,
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          },
        },
        childrenIds,
      },
    },
    ...allComponents,
  };

  return emailLayout;
}

async function runPipeline() {
  const subjectLine = await generateEmailSubject(topic, description);
    const emailSections = await generateEmailSections(subjectLine);

  const emailTheme = await generateEmailTheme(
    subjectLine,
    topic,
    description,
    emailSections
  );
  console.log("emailSectionsemailSections",emailSections)
    console.log("emailThemeemailTheme",emailTheme)

  const allComponents = await processComponentTypes(emailTheme,emailSections);

  const emailLayout = await composeEmailLayout(emailTheme, allComponents);

  return {
    emailLayout
  };
}

module.exports = { runPipeline };

