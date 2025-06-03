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

const nestedChildrenIds = new Set(); // Track all nested IDs

async function processChildComponent(emailTheme, child, section, parentSection, childIndex) {
  console.log("processChildComponent",section, child)
  console.log("parentSectionparentSection", parentSection)
  console.log("childIndexchildIndex", childIndex)

  let componentJson = {};
console.log("child.type",child.type)
  if (child.type === "Text") {
   
    componentJson = await generateTextComponent(emailTheme, {
      ...section,
      content: child.content,
    });
  } else if (child.type === "Image") {
    componentJson = await generateImageComponent(emailTheme,section);
  } else if (child.type === "Button") {
    componentJson = await generateButtonComponent(emailTheme, section,parentSection,childIndex);
  } else if (child.type === "Columns") {
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
      console.log("innersection",innersection)
      console.log("section",section)

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

        Object.assign(allComponents, columnsWithProps);

        const columnsId = Object.keys(columnsWithProps)[0];
        const columnIds = columnsWithProps[columnsId].data.childrenIds;
        const actualColumnIds = [];

        for (const colId of columnIds) {
          const columnComponent = await generateNestedColumnsProperties(colId);
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
              console.log("section11",section)
console.log("kkkkk",columnsWithProps[columnsId].data?.props)
              const generated = await processChildComponent(emailTheme, child, innersection,columnsWithProps[columnsId],childIndex);
              Object.assign(allComponents, generated);

              const generatedId = Object.keys(generated)[0];
              if(generatedId){
                actualChildIds.push(generatedId);
                nestedChildrenIds.add(generatedId);
              } 
            }
          }

          // Update column's childrenIds to actual component IDs
          console.log("actualChildIdsactualChildIds",actualChildIds)
          columnData.data.childrenIds = actualChildIds;
          // columnData.data.childrenIds = actualChildIds.filter(Boolean);

        }

        // Update columns' childrenIds to actual column IDs
        columnsWithProps[columnsId].data.childrenIds = actualColumnIds;
        // nestedChildrenIds.add(columnsId); // Also mark the Columns component itself
      } else if (type === "Divider") {
        console.log("Divider – optionally handle this");
      } else if (type === "Spacer") {
        console.log("Spacer – optionally handle this");
      } else {
        console.warn(`Unknown Component Type: ${type}`);
      }
    }
  }

  return allComponents;
}

async function composeEmailLayout(theme, allComponents) {
  console.log("nestedChildrenIds",nestedChildrenIds)

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
  const emailTheme = await generateEmailTheme(
    subjectLine.subject,
    topic,
    description
  );
  console.log("emailThemeemailTheme",emailTheme)
  const emailSections = await generateEmailSections(subjectLine);
  const allComponents = await processComponentTypes(emailTheme,emailSections);
  const emailLayout = await composeEmailLayout(emailTheme, allComponents);

  return {
    emailLayout,
  };
}

module.exports = { runPipeline };
