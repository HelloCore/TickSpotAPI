import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { parse } from "date-fns";
import { TickspotContext } from "../context.types";
import { Project } from "../api/TickSpotAPI.types";

function validateContext(context: TickspotContext) {
  if (context.apiToken.length === 0 || context.subscriptionId.length === 0) {
    throw new Error("Permission Denied");
  }
}

const resolvers = {
  Mutation: {
    authen(_parent, args, context: TickspotContext) {
      if (args.username == null || args.username.length == 0) {
        throw new Error("Require username");
      }

      if (args.password == null || args.password.length == 0) {
        throw new Error("Require password");
      }
      return context.tickSpotAPI
        .getRoles(args.username, args.password)
        .then(roles => roles.find((a)=>a.company === "Appsynth"));
    },
    createEntry(_parent, args, context: TickspotContext) {
      validateContext(context);
      if (args == null) {
        throw new Error("Require parameters");
      }
      const { date, task_id, hours, notes } = args;
      if (date == null) {
        throw new Error("Require date");
      }
      if (task_id == null) {
        throw new Error("Require task_id");
      }
      if (hours == null) {
        throw new Error("Require hours");
      }
      return context.tickSpotAPI.createEntry({
        date,
        hours,
        task_id,
        notes
      });
    },
    updateEntry(_parent, args, context: TickspotContext) {
      validateContext(context);
      if (args == null) {
        throw new Error("Require parameters");
      }
      const { id, hours, notes } = args;
      if (id == null) {
        throw new Error("Require id");
      }
      if (hours == null) {
        throw new Error("Require hours");
      }
      return context.tickSpotAPI.updateEntry({
        id,
        hours,
        notes
      });
    },
    deleteEntry(_parent, args, context: TickspotContext) {
      validateContext(context);
      if (args == null || args.id == null) {
        throw new Error("Require id");
      }
      const { id } = args;
      return context.tickSpotAPI.deleteEntry(id);
    }
  },
  Query: {
    projects(_parent, _, context: TickspotContext) {
      validateContext(context);
      return context.tickSpotAPI.getProjects();
    },
    tasks(_parent, args, context: TickspotContext) {
      validateContext(context);
      if (args.project_id == null) {
        throw new Error("Require project_id");
      }
      return context.tickSpotAPI.getTasks(args.project_id);
    },
    entry(_parent, args, context: TickspotContext) {
      validateContext(context);
      if (args.date == null) {
        throw new Error("Require date");
      }
      return context.tickSpotAPI.getEntry(args.date);
    },
    entries(_parent, args, context: TickspotContext) {
      validateContext(context);
      if (args.start_date == null || args.start_date.length == 0) {
        throw new Error("Require start_date");
      }
      if (args.end_date == null || args.end_date.length == 0) {
        throw new Error("Require end_date");
      }
      return context.tickSpotAPI.getEntries({
        start_date: args.start_date,
        end_date: args.end_date
      });
    }
  },
  Project: {
    tasks(project: Project, _, context: TickspotContext) {
      validateContext(context);
      return context.tickSpotAPI.getTasks(project.id);
    }
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value: string) {
      return parse(value);
    },
    serialize(value: Date) {
      return value.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return parse(ast.value);
      }
      return null;
    }
  })
};

export default resolvers;
